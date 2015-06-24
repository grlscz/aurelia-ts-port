import {IValueChangedCallback, IPropertyObserver, IUnsubscribe, I__HasDeclaredDependencies} from './interfaces';
import {ObserverLocator} from './observer-locator';

export class ComputedPropertyObserver implements IPropertyObserver {
    public obj: Object;
    public propertyName: string;
    public descriptor: PropertyDescriptor;
    public observerLocator: ObserverLocator;
    public callbacks: IValueChangedCallback[];
    public oldValue: any;
    public subscriptions: IUnsubscribe[];
    constructor(obj: Object, propertyName: string, descriptor: PropertyDescriptor, observerLocator: ObserverLocator) {
        this.obj = obj;
        this.propertyName = propertyName;
        this.descriptor = descriptor;
        this.observerLocator = observerLocator;
        this.callbacks = [];
    }

    getValue(): any {
        return this.obj[this.propertyName];
    }

    setValue(newValue: any): void {
        throw new Error('Computed properties cannot be assigned.');
    }

    trigger(newValue: any, oldValue: any): void {
        var callbacks = this.callbacks,
            i = callbacks.length;

        while (i--) {
            callbacks[i](newValue, oldValue);
        }
    }

    evaluate(): void {
        var newValue = this.getValue();
        if (this.oldValue === newValue)
            return;
        this.trigger(newValue, this.oldValue);
        this.oldValue = newValue;
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        var dependencies: string[], i: number, ii: number;

        this.callbacks.push(callback);

        if (this.oldValue === undefined) {
            this.oldValue = this.getValue();
            this.subscriptions = [];

            dependencies = (<I__HasDeclaredDependencies>this.descriptor).get.dependencies;
            for (i = 0, ii = dependencies.length; i < ii; i++) {
                // todo:  consider throwing when a dependency's observer is an instance of DirtyCheckProperty.
                this.subscriptions.push(this.observerLocator.getObserver(this.obj, dependencies[i]).subscribe(() => this.evaluate()));
            }
        }

        return () => {
            this.callbacks.splice(this.callbacks.indexOf(callback), 1);
            if (this.callbacks.length > 0)
                return;
            while (this.subscriptions.length) {
                this.subscriptions.pop()();
            }
            this.oldValue = undefined;
        };
    }
}

export function hasDeclaredDependencies(descriptor: PropertyDescriptor): boolean {
    return <any>(descriptor && descriptor.get && !descriptor.set
        && (<I__HasDeclaredDependencies>descriptor).get.dependencies && (<I__HasDeclaredDependencies>descriptor).get.dependencies.length);
}

export function declarePropertyDependencies(ctor: Function, propertyName: string, dependencies: string[]): void {
    var descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(ctor.prototype, propertyName);
    if (descriptor.set)
        throw new Error('The property cannot have a setter function.');
    (<I__HasDeclaredDependencies>descriptor).get.dependencies = dependencies;
}
