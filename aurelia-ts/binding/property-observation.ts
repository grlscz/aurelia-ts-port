import {IUnsubscribe, IPropertyObserver, IValueChangedCallback, IObjectObserve, IObjectObserveChangeRecord, I__OoPropertyObserver} from './interfaces';
import {ITask, TaskQueue} from 'aurelia-task-queue';
import {ObserverLocator} from './observer-locator';
import {Dictionary} from 'tsutil';

import core from 'core-js'

export class SetterObserver implements IPropertyObserver, ITask {
    public taskQueue: TaskQueue;
    public obj: Object;
    public propertyName: string;
    public callbacks: IValueChangedCallback[];
    public queued: boolean;
    public observing: boolean;
    public currentValue: any;
    public oldValue: any;
    constructor(taskQueue: TaskQueue, obj: Object, propertyName: string) {
        this.taskQueue = taskQueue;
        this.obj = obj;
        this.propertyName = propertyName;
        this.callbacks = [];
        this.queued = false;
        this.observing = false;
    }

    getValue(): any {
        return this.obj[this.propertyName];
    }

    setValue(newValue: any): void {
        this.obj[this.propertyName] = newValue;
    }

    getterValue(): any {
        return this.currentValue;
    }

    setterValue(newValue: any): void {
        var oldValue = this.currentValue;

        if (oldValue !== newValue) {
            if (!this.queued) {
                this.oldValue = oldValue;
                this.queued = true;
                this.taskQueue.queueMicroTask(this);
            }

            this.currentValue = newValue;
        }
    }

    call(): void {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.currentValue;

        this.queued = false;

        while (i--) {
            callbacks[i](newValue, oldValue);
        }
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        var callbacks = this.callbacks;
        callbacks.push(callback);

        if (!this.observing) {
            this.convertProperty();
        }

        return function () {
            callbacks.splice(callbacks.indexOf(callback), 1);
        };
    }

    convertProperty(): void {
        this.observing = true;
        this.currentValue = this.obj[this.propertyName];
        this.setValue = this.setterValue;
        this.getValue = this.getterValue;

        try {
            Object.defineProperty(this.obj, this.propertyName, {
                configurable: true,
                enumerable: true,
                get: this.getValue.bind(this),
                set: this.setValue.bind(this)
            });
        } catch (_) { }
    }
}

export class OoObjectObserver {
    public obj: Object;
    public observers: Dictionary<I__OoPropertyObserver>;
    public observerLocator: ObserverLocator;
    public observing: boolean;
    constructor(obj: Object, observerLocator: ObserverLocator) {
        this.obj = obj;
        this.observers = {};
        this.observerLocator = observerLocator;
    }

    subscribe(propertyObserver: I__OoPropertyObserver, callback?: IValueChangedCallback): IUnsubscribe {
        var callbacks = propertyObserver.callbacks;
        callbacks.push(callback);

        if (!this.observing) {
            this.observing = true;
            try {
                (<IObjectObserve>Object).observe(this.obj, changes => this.handleChanges(changes), ['update', 'add']);
            } catch (_) { }
        }

        return function () {
            callbacks.splice(callbacks.indexOf(callback), 1);
        };
    }

    getObserver(propertyName: string, descriptor?: PropertyDescriptor): I__OoPropertyObserver {
        var propertyObserver = this.observers[propertyName];
        if (!propertyObserver) {
            if (descriptor) {
                propertyObserver = this.observers[propertyName] = new OoPropertyObserver(this, this.obj, propertyName);
            } else {
                propertyObserver = this.observers[propertyName] = new UndefinedPropertyObserver(this, this.obj, propertyName);
            }
        }
        return propertyObserver;
    }

    handleChanges(changeRecords: IObjectObserveChangeRecord[]) {
        var updates: Dictionary<IObjectObserveChangeRecord> = {},
            observers = this.observers,
            change: IObjectObserveChangeRecord, observer: I__OoPropertyObserver;
        for (var i = 0, ii = changeRecords.length; i < ii; ++i) {
            change = changeRecords[i];
            updates[change.name] = change;
        }

        for (var key in updates) {
            observer = observers[key],
            change = updates[key];

            if (observer) {
                observer.trigger(change.object[key], change.oldValue);
            }
        }
    }
}

export class OoPropertyObserver implements I__OoPropertyObserver {
    public owner: OoObjectObserver;
    public obj: Object;
    public propertyName: string;
    public callbacks: IValueChangedCallback[];
    constructor(owner: OoObjectObserver, obj: Object, propertyName: string) {
        this.owner = owner;
        this.obj = obj;
        this.propertyName = propertyName;
        this.callbacks = [];
    }

    getValue(): any {
        return this.obj[this.propertyName];
    }

    setValue(newValue: any): void {
        this.obj[this.propertyName] = newValue;
    }

    trigger(newValue: any, oldValue: any): void {
        var callbacks = this.callbacks,
            i = callbacks.length;

        while (i--) {
            callbacks[i](newValue, oldValue);
        }
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        return this.owner.subscribe(this, callback);
    }
}

export class UndefinedPropertyObserver implements I__OoPropertyObserver {
    public owner: OoObjectObserver;
    public obj: Object;
    public propertyName: string;
    public callbackMap: Map<IValueChangedCallback, IUnsubscribe>;
    public callbacks: IValueChangedCallback[];
    public actual: IPropertyObserver;
    public subscription: IUnsubscribe;
    constructor(owner: OoObjectObserver, obj: Object, propertyName: string) {
        this.owner = owner;
        this.obj = obj;
        this.propertyName = propertyName;
        this.callbackMap = new Map<IValueChangedCallback, IUnsubscribe>();
        this.callbacks = []; // unused here, but required by owner OoObjectObserver.
    }

    getValue(): any {
        // delegate this to the actual observer if possible.
        if (this.actual) {
            return this.actual.getValue();
        }
        return this.obj[this.propertyName];
    }

    setValue(newValue: any): void {
        // delegate this to the actual observer if possible.
        if (this.actual) {
            this.actual.setValue(newValue);
            return;
        }
        // define the property and trigger the callbacks.
        this.obj[this.propertyName] = newValue;
        this.trigger(newValue, undefined);
    }

    trigger(newValue: any, oldValue: any): void {
        var callback: IValueChangedCallback;

        // we only care about this event one time:  when the property becomes defined.
        if (this.subscription) {
            this.subscription();
        }

        // get the actual observer.
        this.getObserver();

        // invoke the callbacks.
        for (callback of <any>this.callbackMap.keys()) {
            callback(newValue, oldValue);
        }
    }

    getObserver() {
        var callback: IValueChangedCallback, observerLocator: ObserverLocator;

        // has the property has been defined?
        if (!Object.getOwnPropertyDescriptor(this.obj, this.propertyName)) {
            return;
        }

        // get the actual observer.
        observerLocator = this.owner.observerLocator;
        delete this.owner.observers[this.propertyName];
        delete (<Dictionary<IPropertyObserver>>(<any>observerLocator.getObserversLookup)(this.obj, observerLocator))[this.propertyName];
        this.actual = observerLocator.getObserver(this.obj, this.propertyName);

        // attach any existing callbacks to the actual observer.
        for (callback of <any>this.callbackMap.keys()) {
            this.callbackMap.set(callback, this.actual.subscribe(callback));
        }
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        // attempt to get the actual observer in case the property has become
        // defined since the ObserverLocator returned [this].
        if (!this.actual) {
            this.getObserver();
        }

        // if we have the actual observer, use it.
        if (this.actual) {
            return this.actual.subscribe(callback);
        }

        // start listening for the property to become defined.
        if (!this.subscription) {
            this.subscription = this.owner.subscribe(this);
        }

        // cache the callback.
        this.callbackMap.set(callback, null);

        // return the method to dispose the subscription.
        return () => {
            var actualDispose = this.callbackMap.get(callback);
            if (actualDispose)
                actualDispose();
            this.callbackMap.delete(callback);
        };
    }
}
