declare module 'aurelia-metadata/interfaces' {
	import { DecoratorApplicator } from 'aurelia-metadata/decorator-applicator';
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
	    (...args: any[]): DecoratorApplicator;
	}
	export interface IMetadata {
	    resource: string;
	    paramTypes: string;
	    properties: string;
	    get<T>(metadataKey: any, target: Object): T;
	    getOwn<T>(metadataKey: any, target: Object): T;
	    getOrCreateOwn<T>(metadataKey: any, Type: new () => T, target: Object): T;
	    get<T>(metadataKey: any, target: Object, propertyKey: string | symbol): T;
	    getOwn<T>(metadataKey: any, target: Object, propertyKey: string | symbol): T;
	    getOrCreateOwn<T>(metadataKey: any, Type: new () => T, target: Object, propertyKey: string | symbol): T;
	}

}
declare module 'aurelia-metadata/metadata' {
	import { IMetadata } from 'aurelia-metadata/interfaces';
	/**
	* Provides helpers for working with metadata.
	*
	* @class Metadata
	* @static
	*/
	export var Metadata: IMetadata;

}
declare module 'aurelia-metadata/decorator-applicator' {
	export class DecoratorApplicator {
	    private _first;
	    private _second;
	    private _third;
	    private _rest;
	    constructor();
	    decorator(decorator: ClassDecorator): DecoratorApplicator;
	    _decorate(target: Function): void;
	}

}
declare module 'aurelia-metadata/decorators' {
	export var Decorators: {
	    configure: {
	        parameterizedDecorator(name: string, decorator: (...args: any[]) => <TFunction extends Function>(target: TFunction) => void | TFunction): void;
	        simpleDecorator(name: any, decorator: <TFunction extends Function>(target: TFunction) => void | TFunction): void;
	    };
	};

}
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
	    static get(fn: Object | IHasOriginSource): IOrigin;
	    /**
	    * Set the Origin annotation for the specified function.
	    *
	    * @method set
	    * @static
	    * @param {Function} fn The function to set the Origin metadata on.
	    * @param {origin} fn The Origin metadata to store on the function.
	    * @return {Origin} Returns the Origin metadata.
	    */
	    static set(fn: Object, origin: IOrigin): void;
	}

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

}
declare module 'aurelia-metadata' {
	export * from 'aurelia-metadata/index';
}
