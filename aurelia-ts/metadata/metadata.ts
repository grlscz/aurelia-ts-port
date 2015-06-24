import {IHasDecoratorsApplicator, IMetadata} from './interfaces';
import {DecoratorApplicator} from './decorator-applicator';

import * as meta from './reflect-metadata';

function ensureDecorators(target: IHasDecoratorsApplicator) {
    var applicator: DecoratorApplicator;

    if (typeof target.decorators === 'function') {
        applicator = (<() => DecoratorApplicator>target.decorators)();
    } else {
        applicator = <DecoratorApplicator>target.decorators;
    }

    if (typeof applicator._decorate === 'function') {
        delete target.decorators;
        applicator._decorate(target);
    } else {
        throw new Error('The return value of your decorator\'s method was not valid.');
    }
}

/**
* Provides helpers for working with metadata.
*
* @class Metadata
* @static
*/
export var Metadata: IMetadata = {
    resource: 'aurelia:resource',
    paramTypes: 'design:paramtypes',
    properties: 'design:properties',
    get<T>(metadataKey: any, target: Object, propertyKey?: string | symbol): T {
        if (!target) {
            return undefined;
        }

        let result: T = Metadata.getOwn<T>(metadataKey, target, propertyKey);
        return result === undefined ? Metadata.get<T>(metadataKey, Object.getPrototypeOf(target), propertyKey) : result;
    },
    getOwn<T>(metadataKey: any, target: Object, propertyKey?: string | symbol): T {
        if (!target) {
            return undefined;
        }

        if (target.hasOwnProperty('decorators')) {
            ensureDecorators(<IHasDecoratorsApplicator>target);
        }

        return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
    },
    getOrCreateOwn<T>(metadataKey: any, Type: new () => T, target: Object, propertyKey?: string | symbol): T {
        let result: T = Metadata.getOwn<T>(metadataKey, target, propertyKey);

        if (result === undefined) {
            result = new Type();
            Reflect.defineMetadata(metadataKey, result, target, propertyKey);
        }

        return result;
    }
}
