import {I__HasDeclaredDependencies} from './interfaces';

import {Decorators, Metadata, } from 'aurelia-metadata';
import {ValueConverterResource} from './value-converter';

export {EventManager} from './event-manager';
export {ObserverLocator, ObjectObservationAdapter} from './observer-locator';
export {ValueConverterResource} from './value-converter';
export {calcSplices} from './array-change-records';
export * from './binding-modes';
export {Parser} from './parser';
export {BindingExpression} from './binding-expression';
export {ListenerExpression} from './listener-expression';
export {NameExpression} from './name-expression';
export {CallExpression} from './call-expression';
export {DirtyChecker} from './dirty-checking';
export {getChangeRecords} from './map-change-records';
export {ComputedPropertyObserver, declarePropertyDependencies} from './computed-observation';

//ES7 Decorators
export function valueConverter(): ClassDecorator;
export function valueConverter(name: string): ClassDecorator;
export function valueConverter(target: Function): void;
export function valueConverter(nameOrTarget?: string | Function): any {
    if (nameOrTarget === undefined || typeof nameOrTarget === 'string') {
        return function (target: Object) {
            Reflect.defineMetadata(Metadata.resource, new ValueConverterResource(<string>nameOrTarget), target);
        }
    }

    Reflect.defineMetadata(Metadata.resource, new ValueConverterResource(), <Function>nameOrTarget);
}

Decorators.configure.parameterizedDecorator('valueConverter', valueConverter);

export function computedFrom(...rest: string[]): MethodDecorator {
    return function (target: Object, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
        if (descriptor.set) {
            throw new Error(`The computed property "${key}" cannot have a setter function.`);
        }
        (<I__HasDeclaredDependencies>descriptor).get.dependencies = rest;
        return descriptor;
    }
}
