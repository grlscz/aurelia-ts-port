import {IOrigin, TOriginSource, IHasOriginSource} from './interfaces';

import core from 'core-js'

var originStorage = new Map<Object, Origin>(),
    unknownOrigin: IOrigin = Object.freeze({ moduleId: undefined, moduleMember: undefined });

function ensureType(value: TOriginSource): Origin {
    if (value instanceof Origin) {
        return <Origin>value;
    }

    return new Origin(<string>value);
}

/**
* A metadata annotation that describes the origin module of the function to which it's attached.
*
* @class Origin
* @constructor
* @param {string} moduleId The origin module id.
* @param {string} moduleMember The name of the export in the origin module.
*/
export class Origin implements IOrigin {
    public moduleId: string;
    public moduleMember: string;
    constructor(moduleId: string, moduleMember?: string) {
        this.moduleId = moduleId;
        this.moduleMember = moduleMember;
    }

    /**
    * Get the Origin annotation for the specified function.
    *
    * @method get
    * @static
    * @param {Function} fn The function to inspect for Origin metadata.
    * @return {Origin} Returns the Origin metadata.
    */
    static get(fn: Object | IHasOriginSource): IOrigin {
        var origin = originStorage.get(fn);

        if (origin !== undefined) {
            return origin;
        }

        if (typeof (<IHasOriginSource>fn).origin === 'function') {
            originStorage.set(fn, origin = ensureType((<() => TOriginSource>(<IHasOriginSource>fn).origin)()));
        } else if ((<IHasOriginSource>fn).origin !== undefined) {
            originStorage.set(fn, origin = ensureType(<TOriginSource>(<IHasOriginSource>fn).origin));
        }

        return origin || unknownOrigin;
    }

    /**
    * Set the Origin annotation for the specified function.
    *
    * @method set
    * @static
    * @param {Function} fn The function to set the Origin metadata on.
    * @param {origin} fn The Origin metadata to store on the function.
    * @return {Origin} Returns the Origin metadata.
    */
    static set(fn: Object, origin: IOrigin): void {
        if (Origin.get(fn) === unknownOrigin) {
            originStorage.set(fn, origin);
        }
    }
}
