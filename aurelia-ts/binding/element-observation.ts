import {IPropertyObserver, IValueChangedCallback, IUnsubscribe, IElementHandler, IBindablePropertyObserver, I__HTMLElementWithModel} from './interfaces';
import {Dictionary} from 'tsutil';
import {ObserverLocator} from './observer-locator';

export class XLinkAttributeObserver implements IPropertyObserver {
    // xlink namespaced attributes require getAttributeNS/setAttributeNS
    // (even though the NS version doesn't work for other namespaces
    // in html5 documents)
    public element: Element;
    public propertyName: string;
    public attributeName: string;
    constructor(element: Element, propertyName: string, attributeName: string) {
        this.element = element;
        this.propertyName = propertyName;
        this.attributeName = attributeName;
    }

    getValue(): string {
        return this.element.getAttributeNS('http://www.w3.org/1999/xlink', this.attributeName);
    }

    setValue(newValue: string): void {
        return this.element.setAttributeNS('http://www.w3.org/1999/xlink', this.attributeName, newValue);
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        throw new Error(`Observation of an Element\'s "${this.propertyName}" property is not supported.`);
    }
}

export class DataAttributeObserver implements IPropertyObserver {
    public element: Element;
    public propertyName: string;
    constructor(element: Element, propertyName: string) {
        this.element = element;
        this.propertyName = propertyName;
    }

    getValue(): string {
        return this.element.getAttribute(this.propertyName);
    }

    setValue(newValue: string): void {
        return this.element.setAttribute(this.propertyName, newValue);
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        throw new Error(`Observation of an Element\'s "${this.propertyName}" property is not supported.`);
    }
}

export class StyleObserver implements IPropertyObserver {
    public element: HTMLElement;
    public propertyName: string;
    constructor(element: HTMLElement, propertyName: string) {
        this.element = element;
        this.propertyName = propertyName;
    }

    getValue(): string {
        return this.element.style.cssText;
    }

    setValue(newValue: any): void {
        if (newValue instanceof Object) {
            newValue = this.flattenCss(newValue);
        }
        this.element.style.cssText = newValue;
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        throw new Error(`Observation of an Element\'s "${this.propertyName}" property is not supported.`);
    }

    flattenCss(object: Dictionary<string>): string {
        var s = '';
        for (var propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                s += propertyName + ': ' + object[propertyName] + '; ';
            }
        }
        return s;
    }
}

export class ValueAttributeObserver implements IPropertyObserver {
    public element: Element;
    public propertyName: string;
    public handler: IElementHandler;
    public callbacks: IValueChangedCallback[];
    public oldValue: any;
    public disposeHandler: IUnsubscribe;
    constructor(element: Element, propertyName: string, handler: IElementHandler) {
        this.element = element;
        this.propertyName = propertyName;
        this.handler = handler;
        this.callbacks = [];
    }

    getValue(): any {
        return this.element[this.propertyName];
    }

    setValue(newValue: any): void {
        this.element[this.propertyName] = newValue;
        this.call();
    }

    call(): void {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.getValue();

        while (i--) {
            callbacks[i](newValue, oldValue);
        }

        this.oldValue = newValue;
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        var that = this;

        if (!this.disposeHandler) {
            this.oldValue = this.getValue();
            this.disposeHandler = this.handler.subscribe(this.element, this.call.bind(this));
        }

        this.callbacks.push(callback);

        return this.unsubscribe.bind(this, callback);
    }

    unsubscribe(callback: IValueChangedCallback): void {
        var callbacks = this.callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
        if (callbacks.length === 0) {
            this.disposeHandler();
            this.disposeHandler = null;
        }
    }
}

export class SelectValueObserver implements IPropertyObserver, IBindablePropertyObserver {
    public element: HTMLSelectElement;
    public handler: IElementHandler;
    public observerLocator: ObserverLocator;
    public value: string | string[];
    public arraySubscription: IUnsubscribe;
    public initialSync: boolean;
    public oldValue: string | string[];
    public callbacks: IValueChangedCallback[];
    public disposeHandler: IUnsubscribe;
    public domObserver: MutationObserver;
    constructor(element: HTMLSelectElement, handler: IElementHandler, observerLocator: ObserverLocator) {
        this.element = element;
        this.handler = handler;
        this.observerLocator = observerLocator;
    }

    getValue(): string | string[] {
        return this.value;
    }

    setValue(newValue: string| string[]): void {
        if (newValue !== null && newValue !== undefined && this.element.multiple && !Array.isArray(newValue)) {
            throw new Error('Only null or Array instances can be bound to a multi-select.')
        }
        if (this.value === newValue) {
            return;
        }
        // unsubscribe from old array.
        if (this.arraySubscription) {
            this.arraySubscription();
            this.arraySubscription = null;
        }
        // subscribe to new array.
        if (Array.isArray(newValue)) {
            this.arraySubscription = this.observerLocator.getArrayObserver(<string[]>newValue)
                .subscribe(this.synchronizeOptions.bind(this));
        }
        // assign and sync element.
        this.value = newValue;
        this.synchronizeOptions();
        // queue up an initial sync after the bindings have been evaluated.
        if (this.element.options.length > 0 && !this.initialSync) {
            this.initialSync = true;
            this.observerLocator.taskQueue.queueMicroTask({ call: () => this.synchronizeOptions() });
        }
    }

    synchronizeOptions() {
        var value = this.value, i: number, options: HTMLSelectElement, option: HTMLOptionElement, optionValue: string, clear: boolean, isArray: boolean;

        if (value === null || value === undefined) {
            clear = true;
        } else if (Array.isArray(value)) {
            isArray = true;
        }

        options = this.element.options;
        i = options.length;
        while (i--) {
            option = options.item(i);
            if (clear) {
                option.selected = false;
                continue;
            }
            optionValue = option.hasOwnProperty('model') ? (<I__HTMLElementWithModel><HTMLElement>option).model : option.value;
            if (isArray) {
                option.selected = value.indexOf(optionValue) !== -1;
                continue;
            }
            option.selected = value === optionValue;
        }
    }

    synchronizeValue(): void {
        var options = this.element.options, option: HTMLOptionElement, i: number, ii: number, count: number = 0, value: string | string[] = [];

        for (i = 0, ii = options.length; i < ii; i++) {
            option = options.item(i);
            if (!option.selected) {
                continue;
            }
            value[count] = option.hasOwnProperty('model') ? (<I__HTMLElementWithModel><HTMLElement>option).model : option.value;
            count++;
        }

        if (!this.element.multiple) {
            if (count === 0) {
                value = null;
            } else {
                value = value[0];
            }
        }

        this.oldValue = this.value;
        this.value = value;
        this.call();
    }

    call(): void {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.value;

        while (i--) {
            callbacks[i](newValue, oldValue);
        }
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        if (!this.callbacks) {
            this.callbacks = [];
            this.disposeHandler = this.handler
                .subscribe(this.element, this.synchronizeValue.bind(this, false));
        }

        this.callbacks.push(callback);
        return this.unsubscribe.bind(this, callback);
    }

    unsubscribe(callback: IValueChangedCallback): void {
        var callbacks = this.callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
        if (callbacks.length === 0) {
            this.disposeHandler();
            this.disposeHandler = null;
            this.callbacks = null;
        }
    }

    bind(): void {
        this.domObserver = new MutationObserver(() => {
            this.synchronizeOptions();
            this.synchronizeValue();
        });
        this.domObserver.observe(this.element, { childList: true, subtree: true });
    }

    unbind(): void {
        this.domObserver.disconnect();
        this.domObserver = null;

        if (this.arraySubscription) {
            this.arraySubscription();
            this.arraySubscription = null;
        }
    }
}

export class CheckedObserver implements IPropertyObserver, IBindablePropertyObserver {
    public element: HTMLInputElement;
    public handler: IElementHandler;
    public observerLocator: ObserverLocator;
    public value: boolean | string | string[];
    public arraySubscription: IUnsubscribe;
    public initialSync: boolean;
    public oldValue: boolean | string | string[];
    public callbacks: IValueChangedCallback[];
    public disposeHandler: IUnsubscribe;
    constructor(element: HTMLInputElement, handler: IElementHandler, observerLocator: ObserverLocator) {
        this.element = element;
        this.handler = handler;
        this.observerLocator = observerLocator;
    }

    getValue(): boolean | string | string[] {
        return this.value;
    }

    setValue(newValue: boolean | string | string[]): void {
        if (this.value === newValue) {
            return;
        }
        // unsubscribe from old array.
        if (this.arraySubscription) {
            this.arraySubscription();
            this.arraySubscription = null;
        }
        // subscribe to new array.
        if (this.element.type === 'checkbox' && Array.isArray(newValue)) {
            this.arraySubscription = this.observerLocator.getArrayObserver(<string[]>newValue)
                .subscribe(this.synchronizeElement.bind(this));
        }
        // assign and sync element.
        this.value = newValue;
        this.synchronizeElement();
        // queue up an initial sync after the bindings have been evaluated.
        if (!this.element.hasOwnProperty('model') && !this.initialSync) {
            this.initialSync = true;
            this.observerLocator.taskQueue.queueMicroTask({ call: () => this.synchronizeElement() });
        }
    }

    synchronizeElement(): void {
        var value = this.value,
            element = this.element,
            elementValue = element.hasOwnProperty('model') ? (<I__HTMLElementWithModel><HTMLElement>element).model : element.value,
            isRadio = element.type === 'radio';

        element.checked =
        isRadio && value === elementValue
        || !isRadio && value === true
        || !isRadio && Array.isArray(value) && (<string[]>value).indexOf(elementValue) !== -1;
    }

    synchronizeValue(): void {
        var value = this.value,
            element = this.element,
            elementValue = element.hasOwnProperty('model') ? (<I__HTMLElementWithModel><HTMLElement>element).model : element.value,
            index;

        if (element.type === 'checkbox') {
            if (Array.isArray(value)) {
                index = (<string[]>value).indexOf(elementValue);
                if (element.checked && index === -1) {
                    (<string[]>value).push(elementValue);
                } else if (!element.checked && index !== -1) {
                    (<string[]>value).splice(index, 1);
                }
                // don't invoke callbacks.
                return;
            } else {
                value = element.checked;
            }
        } else if (element.checked) {
            value = elementValue;
        } else {
            // don't invoke callbacks.
            return;
        }

        this.oldValue = this.value;
        this.value = value;
        this.call();
    }

    call(): void {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.value;

        while (i--) {
            callbacks[i](newValue, oldValue);
        }
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        if (!this.callbacks) {
            this.callbacks = [];
            this.disposeHandler = this.handler
                .subscribe(this.element, this.synchronizeValue.bind(this, false));
        }

        this.callbacks.push(callback);
        return this.unsubscribe.bind(this, callback);
    }

    unsubscribe(callback: IValueChangedCallback): void {
        var callbacks = this.callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
        if (callbacks.length === 0) {
            this.disposeHandler();
            this.disposeHandler = null;
            this.callbacks = null;
        }
    }

    unbind(): void {
        if (this.arraySubscription) {
            this.arraySubscription();
            this.arraySubscription = null;
        }
    }
}
