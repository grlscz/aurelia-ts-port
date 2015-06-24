import {IPropertyObserver, IArrayObserver, IMapObserver, I__HasObserversLookup, I__ObjectGetPropertyDescriptor, IElementHandler, I__HasOoObserver, I__HasArrayObserver, I__HasMapObserver} from './interfaces';
import {Dictionary} from 'tsutil';
import {TaskQueue} from 'aurelia-task-queue';

import {hasObjectObserve} from './environment';
import {getArrayObserver} from './array-observation';
import {getMapObserver} from './map-observation';
import {EventManager} from './event-manager';
import {DirtyChecker, DirtyCheckProperty} from './dirty-checking';
import {
SetterObserver,
OoObjectObserver,
OoPropertyObserver
} from './property-observation';
import {
SelectValueObserver,
CheckedObserver,
ValueAttributeObserver,
XLinkAttributeObserver,
DataAttributeObserver,
StyleObserver
} from './element-observation';
import {All, IHasInjectionInfo} from 'aurelia-dependency-injection';
import {
hasDeclaredDependencies,
ComputedPropertyObserver
} from './computed-observation';

if (typeof (<I__ObjectGetPropertyDescriptor>Object).getPropertyDescriptor !== 'function') {
    (<I__ObjectGetPropertyDescriptor>Object).getPropertyDescriptor = function (subject: any, name: string | number | symbol): PropertyDescriptor {
        var pd = Object.getOwnPropertyDescriptor(subject, name);
        var proto = Object.getPrototypeOf(subject);
        while (typeof pd === 'undefined' && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return pd;
    };
}

function createObserversLookup(obj: Object): Dictionary<IPropertyObserver> {
    var value: Dictionary<IPropertyObserver> = {};

    try {
        Object.defineProperty(obj, "__observers__", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: value
        });
    } catch (_) { }

    return value;
}

function createObserverLookup(obj: Object, observerLocator: ObserverLocator): OoObjectObserver {
    var value = new OoObjectObserver(obj, observerLocator);

    try {
        Object.defineProperty(obj, "__observer__", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: value
        });
    } catch (_) { }

    return value;
}

export class ObserverLocator {
    public taskQueue: TaskQueue;
    public eventManager: EventManager;
    public dirtyChecker: DirtyChecker;
    public observationAdapters: ObjectObservationAdapter[];
    static inject() { return [TaskQueue, EventManager, DirtyChecker, All.of(ObjectObservationAdapter)]; }
    constructor(taskQueue: TaskQueue, eventManager: EventManager, dirtyChecker: DirtyChecker, observationAdapters: ObjectObservationAdapter[]) {
        this.taskQueue = taskQueue;
        this.eventManager = eventManager;
        this.dirtyChecker = dirtyChecker;
        this.observationAdapters = observationAdapters;
    }

    getObserversLookup(obj: Object): Dictionary<IPropertyObserver> {
        return (<I__HasObserversLookup>obj).__observers__ || createObserversLookup(obj);
    }

    getObserver(obj: Object, propertyName: string): IPropertyObserver {
        var observersLookup = this.getObserversLookup(obj);

        if (propertyName in observersLookup) {
            return observersLookup[propertyName];
        }

        return observersLookup[propertyName] = this.createPropertyObserver(
            obj,
            propertyName
            );
    }

    getObservationAdapter(obj: Object, propertyName: string, descriptor: PropertyDescriptor): ObjectObservationAdapter {
        var i: number, ii: number, observationAdapter: ObjectObservationAdapter;
        for (i = 0, ii = this.observationAdapters.length; i < ii; i++) {
            observationAdapter = this.observationAdapters[i];
            if (observationAdapter.handlesProperty(obj, propertyName, descriptor))
                return observationAdapter;
        }
        return null;
    }

    createPropertyObserver(obj: Object, propertyName: string): IPropertyObserver {
        var observerLookup: OoObjectObserver, descriptor: PropertyDescriptor, handler: IElementHandler, observationAdapter: ObjectObservationAdapter, xlinkResult: RegExpExecArray;

        if (obj instanceof Element) {
            handler = this.eventManager.getElementHandler(obj, propertyName);
            if (propertyName === 'value' && obj.tagName.toLowerCase() === 'select') {
                return new SelectValueObserver(<HTMLSelectElement>obj, handler, this);
            }
            if (propertyName === 'checked' && obj.tagName.toLowerCase() === 'input') {
                return new CheckedObserver(<HTMLInputElement>obj, handler, this);
            }
            if (handler) {
                return new ValueAttributeObserver(obj, propertyName, handler);
            }
            xlinkResult = /^xlink:(.+)$/.exec(propertyName);
            if (xlinkResult) {
                return new XLinkAttributeObserver(obj, propertyName, xlinkResult[1]);
            }
            if (/^\w+:|^data-|^aria-/.test(propertyName) || obj instanceof SVGElement) {
                return new DataAttributeObserver(obj, propertyName);
            }
            if (propertyName === 'style' || propertyName === 'css') {
                return new StyleObserver(<HTMLElement>obj, propertyName);
            }
        }

        descriptor = (<I__ObjectGetPropertyDescriptor>Object).getPropertyDescriptor(obj, propertyName);

        if (hasDeclaredDependencies(descriptor)) {
            return new ComputedPropertyObserver(obj, propertyName, descriptor, this)
        }

        if (descriptor && (descriptor.get || descriptor.set)) {
            // attempt to use an adapter before resorting to dirty checking.
            observationAdapter = this.getObservationAdapter(obj, propertyName, descriptor);
            if (observationAdapter)
                return observationAdapter.getObserver(obj, propertyName, descriptor);
            return new DirtyCheckProperty(this.dirtyChecker, obj, propertyName);
        }

        if (hasObjectObserve) {
            observerLookup = (<I__HasOoObserver>obj).__observer__ || createObserverLookup(obj, this);
            return observerLookup.getObserver(propertyName, descriptor);
        }

        if (obj instanceof Array) {
            observerLookup = <any>this.getArrayObserver(obj); // error?
            return observerLookup.getObserver(propertyName);
        } else if (obj instanceof Map) {
            observerLookup = <any>this.getMapObserver(obj); // error?
            return observerLookup.getObserver(propertyName);
        }

        return new SetterObserver(this.taskQueue, obj, propertyName);
    }

    getArrayObserver(array: any[]): IArrayObserver {
        if ('__array_observer__' in array) {
            return (<I__HasArrayObserver>array).__array_observer__;
        }

        return (<I__HasArrayObserver>array).__array_observer__ = getArrayObserver(this.taskQueue, array);
    }

    getMapObserver(map: Map<any, any>): IMapObserver {
        if ('__map_observer__' in map) {
            return (<I__HasMapObserver>map).__map_observer__;
        }

        return (<I__HasMapObserver>map).__map_observer__ = getMapObserver(this.taskQueue, map);
    }
}

export class ObjectObservationAdapter {
    handlesProperty(object: Object, propertyName: string, descriptor: PropertyDescriptor): boolean {
        throw new Error('BindingAdapters must implement handlesProperty(object, propertyName).');
    }

    getObserver(object: Object, propertyName: string, descriptor: PropertyDescriptor): IPropertyObserver {
        throw new Error('BindingAdapters must implement createObserver(object, propertyName).');
    }
}
