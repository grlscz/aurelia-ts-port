declare module 'aurelia-metadata/origin' {
	import { IOrigin, IHasOriginSource } from 'aurelia-metadata/interfaces';
	/**
	* A metadata annotation that describes the origin module of the function to which it's attached.
	*
	* @class Origin
	* @constructor
	* @param {string} moduleId The origin module id.
	* @param {string} moduleMember The name of the export in the origin module.
	*/
	export class Origin implements IOrigin {
	    moduleId: string;
	    moduleMember: string;
	    constructor(moduleId: string, moduleMember?: string);
	    /**
	    * Get the Origin annotation for the specified function.
	    *
	    * @method get
	    * @static
	    * @param {Function} fn The function to inspect for Origin metadata.
	    * @return {Origin} Returns the Origin metadata.
	    */
	    static get(fn: IHasOriginSource): IOrigin;
	    /**
	    * Set the Origin annotation for the specified function.
	    *
	    * @method set
	    * @static
	    * @param {Function} fn The function to set the Origin metadata on.
	    * @param {origin} fn The Origin metadata to store on the function.
	    * @return {Origin} Returns the Origin metadata.
	    */
	    static set(fn: IHasOriginSource, origin: Origin): void;
	}

}
declare module 'aurelia-metadata/interfaces' {
	import { Dictionary } from 'aurelia-tsutil';
	import { Origin } from 'aurelia-metadata/origin';
	export interface IHasDecoratorsApplicator {
	    decorators: IDecoratorsApplicator | (() => IDecoratorsApplicator);
	}
	export interface IDecoratorsApplicator {
	    _decorate(any: any): void;
	}
	export interface IOrigin {
	    moduleId: string;
	    moduleMember: string;
	}
	export type OriginSource = string | Origin;
	export interface IHasOriginSource {
	    origin: OriginSource | (() => OriginSource);
	}
	export interface ITypedDecorator<T> {
	    (traget: T): void;
	}
	export interface IDecorator extends ITypedDecorator<Object> {
	}
	export interface IAddDecorator {
	    (...args: any[]): IDecoratorsApplicator;
	}
	export interface IDecorators extends Dictionary<IAddDecorator> {
	}

}
declare module 'aurelia-metadata/metadata' {
	/**
	* Provides helpers for working with metadata.
	*
	* @class Metadata
	* @static
	*/
	export var Metadata: {
	    resource: string;
	    paramTypes: string;
	    properties: string;
	    get(metadataKey: any, target: Object, propertyKey?: string | symbol): any;
	    getOwn(metadataKey: any, target: Object, propertyKey?: string | symbol): any;
	    getOrCreateOwn(metadataKey: any, Type: new () => any, target: Object, propertyKey?: string | symbol): any;
	};

}
declare module 'aurelia-metadata/decorator-applicator' {
	import { IDecoratorsApplicator, IDecorator } from 'aurelia-metadata/interfaces';
	export class DecoratorApplicator implements IDecoratorsApplicator {
	    private _first;
	    private _second;
	    private _third;
	    private _rest;
	    constructor();
	    decorator(decorator: IDecorator): DecoratorApplicator;
	    _decorate(target: any): void;
	}

}
declare module 'aurelia-metadata/decorators' {
	import { IDecorator } from 'aurelia-metadata/interfaces';
	export var Decorators: {
	    configure: {
	        parameterizedDecorator(name: string, decorator: (...args: any[]) => IDecorator): void;
	        simpleDecorator(name: any, decorator: IDecorator): void;
	    };
	};

}
declare module 'aurelia-metadata/index' {
	/**
	 * Utilities for reading and writing the metadata of JavaScript functions.
	 *
	 * @module metadata
	 */
	export { Origin } from 'aurelia-metadata/origin';
	export { Metadata } from 'aurelia-metadata/metadata';
	export { Decorators } from 'aurelia-metadata/decorators';
	export { IDecorator, ITypedDecorator } from 'aurelia-metadata/interfaces';

}
declare module 'aurelia-metadata' {
	export * from 'aurelia-metadata/index';
}
