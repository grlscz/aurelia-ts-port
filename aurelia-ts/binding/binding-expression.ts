import {IPropertyObserver, IAssignableExpression, IValueConverter, IValueConvertersLookup, IValueInfo, IUnsubscribe, BindingMode, IBindablePropertyObserver, IBinding} from './interfaces';
import {ObserverLocator} from './observer-locator';

import {bindingMode} from './binding-modes';

export class BindingExpression {
    public observerLocator: ObserverLocator;
    public targetProperty: string;
    public sourceExpression: IAssignableExpression;
    public mode: BindingMode;
    public valueConverterLookupFunction: IValueConvertersLookup;
    public attribute: string;
    public discrete: boolean;
    constructor(observerLocator: ObserverLocator, targetProperty: string, sourceExpression: IAssignableExpression,
        mode: BindingMode, valueConverterLookupFunction: IValueConvertersLookup, attribute?: string) {
        this.observerLocator = observerLocator;
        this.targetProperty = targetProperty;
        this.sourceExpression = sourceExpression;
        this.mode = mode;
        this.valueConverterLookupFunction = valueConverterLookupFunction;
        this.attribute = attribute;
        this.discrete = false;
    }

    createBinding(target: Object): any {
        return new Binding(
            this.observerLocator,
            this.sourceExpression,
            target,
            this.targetProperty,
            this.mode,
            this.valueConverterLookupFunction
            );
    }
}

class Binding implements IBinding {
    public observerLocator: ObserverLocator;
    public sourceExpression: IAssignableExpression;
    public targetProperty: IPropertyObserver;
    public mode: BindingMode;
    public valueConverterLookupFunction: IValueConvertersLookup;
    public source: Object;
    private _disposeObserver: IUnsubscribe;
    private _disposeListener: IUnsubscribe;
    constructor(observerLocator: ObserverLocator, sourceExpression: IAssignableExpression, target: Object, targetProperty: string, mode: BindingMode, valueConverterLookupFunction: IValueConvertersLookup) {
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.targetProperty = observerLocator.getObserver(target, targetProperty);
        this.mode = mode;
        this.valueConverterLookupFunction = valueConverterLookupFunction;
    }

    getObserver(obj: Object, propertyName: string): IPropertyObserver {
        return this.observerLocator.getObserver(obj, propertyName);
    }

    bind(source: Object): void {
        var targetProperty = this.targetProperty,
            info: IValueInfo;

        if ('bind' in targetProperty) {
            (<IBindablePropertyObserver>targetProperty).bind();
        }

        if (this.mode == bindingMode.oneWay || this.mode == bindingMode.twoWay) {
            if (this._disposeObserver) {
                if (this.source === source) {
                    return;
                }

                this.unbind();
            }

            info = this.sourceExpression.connect(this, source);

            if (info.observer) {
                this._disposeObserver = info.observer.subscribe(newValue => {
                    var existing = targetProperty.getValue();
                    if (newValue !== existing) {
                        targetProperty.setValue(newValue);
                    }
                });
            }

            if (info.value !== undefined) {
                targetProperty.setValue(info.value);
            }

            if (this.mode == bindingMode.twoWay) {
                this._disposeListener = targetProperty.subscribe(newValue => {
                    this.sourceExpression.assign(source, newValue, this.valueConverterLookupFunction);
                });
            }

            this.source = source;
        } else {
            var value = this.sourceExpression.evaluate(source, this.valueConverterLookupFunction);

            if (value !== undefined) {
                targetProperty.setValue(value);
            }
        }
    }

    unbind(): void {
        if ('unbind' in this.targetProperty) {
            (<IBindablePropertyObserver>this.targetProperty).unbind();
        }
        if (this._disposeObserver) {
            this._disposeObserver();
            this._disposeObserver = null;
        }

        if (this._disposeListener) {
            this._disposeListener();
            this._disposeListener = null;
        }
    }
}
