import {IMetadataKeys, InstanceKey, InstanceSource, IInjectionInfo, IRegistration, IActivator} from './interfaces';
export {IActivator, IInjectionInfo, IRegistration} from './interfaces';

/**
 * A lightweight, extensible dependency injection container for JavaScript.
 *
 * @module dependency-injection
 */
import {Decorators, Metadata, ITypedDecorator} from 'aurelia-metadata';
import {TransientRegistration, SingletonRegistration, FactoryActivator} from './metadata';
import {emptyParameters} from './container';
export {
TransientRegistration,
SingletonRegistration,
Resolver,
Lazy,
All,
Optional,
Parent,
ClassActivator,
FactoryActivator
} from './metadata';

export {Container} from './container';

export function autoinject(target: Function): void;
export function autoinject(): ITypedDecorator<Function>;
export function autoinject(target?: Function): any {
    var deco = function (target: Function) {
        (<IInjectionInfo><InstanceSource>target).inject = Reflect.getOwnMetadata(Metadata.paramTypes, target) || emptyParameters;
    };

    return target ? deco(target) : deco;
}

export function inject(...rest: InstanceKey[]): ITypedDecorator<InstanceSource> {
    return function (target: InstanceSource) {
        (<IInjectionInfo>target).inject = rest;
    }
}

export function registration(value: IRegistration): ITypedDecorator<InstanceSource> {
    return function (target: InstanceSource) {
        Reflect.defineMetadata((<IMetadataKeys><any>Metadata).registration, value, target);
    }
}

export function transient(key?: InstanceKey): ITypedDecorator<InstanceSource> {
    return registration(new TransientRegistration(key));
}

export function singleton(registerInChild: boolean): ITypedDecorator<InstanceSource>;
export function singleton(key: InstanceKey, registerInChild?: boolean): ITypedDecorator<InstanceSource>;
export function singleton(keyOrRegisterInChild: InstanceKey | boolean, registerInChild: boolean = false): ITypedDecorator<InstanceSource> {
    return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

export function instanceActivator<T>(value: IActivator<T>): ITypedDecorator<T> {
    return function (target:T) {
        Reflect.defineMetadata((<IMetadataKeys><any>Metadata).instanceActivator, value, target);
    }
}

export function factory(): ITypedDecorator<(...args) => Object> {
    return instanceActivator(FactoryActivator.instance);
}

Decorators.configure.simpleDecorator('autoinject', autoinject);
Decorators.configure.parameterizedDecorator('inject', inject);
Decorators.configure.parameterizedDecorator('registration', registration);
Decorators.configure.parameterizedDecorator('transient', transient);
Decorators.configure.parameterizedDecorator('singleton', singleton);
Decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
Decorators.configure.parameterizedDecorator('factory', factory);
