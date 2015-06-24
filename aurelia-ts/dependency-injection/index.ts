import {IMetadataKeys, InstanceKey, InstanceSource, IHasInjectionInfo, IRegistration, IActivator} from './interfaces';
export {IActivator, IHasInjectionInfo, IRegistration} from './interfaces';

/**
 * A lightweight, extensible dependency injection container for JavaScript.
 *
 * @module dependency-injection
 */
import {Decorators, Metadata} from 'aurelia-metadata';
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
export function autoinject(): ClassDecorator;
export function autoinject(target?: Function): any {
    var deco = function (target: Function) {
        (<IHasInjectionInfo><InstanceSource>target).inject = Reflect.getOwnMetadata(Metadata.paramTypes, target) || emptyParameters;
    };

    return target ? deco(target) : deco;
}

export function inject(...rest: InstanceKey[]): ClassDecorator {
    return function (target: Function) {
        (<IHasInjectionInfo><InstanceSource>target).inject = rest;
    }
}

export function registration(value: IRegistration): ClassDecorator {
    return function (target: Function) {
        Reflect.defineMetadata((<IMetadataKeys><any>Metadata).registration, value, target);
    }
}

export function transient(key?: InstanceKey): ClassDecorator {
    return registration(new TransientRegistration(key));
}

export function singleton(registerInChild: boolean): ClassDecorator;
export function singleton(key: InstanceKey, registerInChild?: boolean): ClassDecorator;
export function singleton(keyOrRegisterInChild: InstanceKey | boolean, registerInChild: boolean = false): ClassDecorator {
    return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

export function instanceActivator<T extends Function>(value: IActivator<T>): ClassDecorator {
    return function (target:T) {
        Reflect.defineMetadata((<IMetadataKeys><any>Metadata).instanceActivator, value, target);
    }
}

export function factory(): ClassDecorator {
    return instanceActivator(FactoryActivator.instance);
}

Decorators.configure.simpleDecorator('autoinject', autoinject);
Decorators.configure.parameterizedDecorator('inject', inject);
Decorators.configure.parameterizedDecorator('registration', registration);
Decorators.configure.parameterizedDecorator('transient', transient);
Decorators.configure.parameterizedDecorator('singleton', singleton);
Decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
Decorators.configure.parameterizedDecorator('factory', factory);
