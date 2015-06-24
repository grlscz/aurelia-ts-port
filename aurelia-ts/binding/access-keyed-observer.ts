import {IValueObserver, IPropertyObserver, IUnsubscribe, IValueInfo} from './interfaces';
import {ObserverLocator} from './observer-locator';

export class AccessKeyedObserver implements IValueObserver {
    objectInfo: IValueInfo;
    keyInfo: IValueInfo;
    evaluate: () => any;
    observerLocator: ObserverLocator;
    disposeKey: IUnsubscribe;
    disposeObject: IUnsubscribe;
    disposeProperty: IUnsubscribe;
    callback: (evaluated: any) => void;
    constructor(objectInfo: IValueInfo, keyInfo: IValueInfo, observerLocator: ObserverLocator, evaluate: () => any) {
        this.objectInfo = objectInfo;
        this.keyInfo = keyInfo;
        this.evaluate = evaluate;
        this.observerLocator = observerLocator;

        if (keyInfo.observer) {
            this.disposeKey = keyInfo.observer.subscribe(newValue => this.objectOrKeyChanged(undefined, newValue));
        }

        if (objectInfo.observer) {
            this.disposeObject = objectInfo.observer.subscribe(newValue => this.objectOrKeyChanged(newValue));
        }

        this.updatePropertySubscription(objectInfo.value, keyInfo.value);
    }

    updatePropertySubscription(object: any, key: any): void {
        var callback: void;
        if (this.disposeProperty) {
            this.disposeProperty();
            this.disposeProperty = null;
        }
        if (object instanceof Object) {  // objects, arrays, etc - (non primitives)
            this.disposeProperty = this.observerLocator.getObserver(object, key)
                .subscribe(() => this.notify());
        }
    }

    objectOrKeyChanged(object: Object, key?: any): void {
        var oo: IValueObserver, ko: IValueObserver;
        object = object || ((oo = this.objectInfo.observer) && (<IPropertyObserver>oo).getValue ? (<IPropertyObserver>oo).getValue() : this.objectInfo.value);
        key = key || ((ko = this.keyInfo.observer) && (<IPropertyObserver>ko).getValue ? (<IPropertyObserver>ko).getValue() : this.keyInfo.value);
        this.updatePropertySubscription(object, key);

        this.notify();
    }

    subscribe(callback: (evaluated: any) => void): IUnsubscribe {
        var that = this;
        that.callback = callback;
        return function () {
            that.callback = null;
        };
    }

    notify(): void {
        var callback = this.callback;

        if (callback) {
            callback(this.evaluate());
        }
    }

    dispose(): void {
        this.objectInfo = null;
        this.keyInfo = null;
        this.evaluate = null;
        this.observerLocator = null;
        if (this.disposeObject) {
            this.disposeObject();
        }
        if (this.disposeKey) {
            this.disposeKey();
        }
        if (this.disposeProperty) {
            this.disposeProperty();
        }
    }
}
