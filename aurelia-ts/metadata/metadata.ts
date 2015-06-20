import {IHasDecoratorsApplicator, IDecoratorsApplicator} from './interfaces';

import * as meta from './reflect-metadata';

function ensureDecorators(target: IHasDecoratorsApplicator) {
    var applicator: IDecoratorsApplicator;

    if (typeof target.decorators === 'function') {
        applicator = (<() => IDecoratorsApplicator>target.decorators)();
    } else {
        applicator = <IDecoratorsApplicator>target.decorators;
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
export var Metadata = {
    resource: 'aurelia:resource',
    paramTypes: 'design:paramtypes',
    properties: 'design:properties',
    get(metadataKey: any, target: Object, propertyKey?: string | symbol): any {
        if (!target) {
            return undefined;
        }

        let result = Metadata.getOwn(metadataKey, target, propertyKey);
        return result === undefined ? Metadata.get(metadataKey, Object.getPrototypeOf(target), propertyKey) : result;
    },
    getOwn(metadataKey: any, target: Object, propertyKey?: string | symbol): any {
        if (!target) {
            return undefined;
        }

        if (target.hasOwnProperty('decorators')) {
            ensureDecorators(<IHasDecoratorsApplicator>target);
        }

        return Reflect.getOwnMetadata(metadataKey, target, propertyKey);
    },
    getOrCreateOwn(metadataKey: any, Type: new () => any, target: Object, propertyKey?: string | symbol) {
        let result = Metadata.getOwn(metadataKey, target, propertyKey);

        if (result === undefined) {
            result = new Type();
            Reflect.defineMetadata(metadataKey, result, target, propertyKey);
        }

        return result;
    }
}
