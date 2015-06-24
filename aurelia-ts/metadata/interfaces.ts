import {DecoratorApplicator} from './decorator-applicator';

export interface IHasDecoratorsApplicator extends Function {
    decorators: DecoratorApplicator | (() => DecoratorApplicator);
}

export interface IOrigin {
    moduleId: string;
    moduleMember: string;
}

export type TOriginSource = string | IOrigin;

export interface IHasOriginSource {
    origin: TOriginSource | (() => TOriginSource);
}

export interface IAddDecorator {
    (...args): DecoratorApplicator;
}


export interface IMetadata {
    // metadata keys
    resource: string;
    paramTypes: string;
    properties: string;
    // for constructor
    get<T>(metadataKey: any, target: Object): T;
    getOwn<T>(metadataKey: any, target: Object): T;
    getOrCreateOwn<T>(metadataKey: any, Type: new () => T, target: Object): T;
    // for property
    get<T>(metadataKey: any, target: Object, propertyKey: string | symbol): T;
    getOwn<T>(metadataKey: any, target: Object, propertyKey: string | symbol): T;
    getOrCreateOwn<T>(metadataKey: any, Type: new () => T, target: Object, propertyKey: string | symbol): T;
}