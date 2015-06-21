declare module 'aurelia-dependency-injection/interfaces' {
	import { Container } from 'aurelia-dependency-injection/container';
	export type InstanceKey = Object;
	export type InstanceSource = Object;
	export interface IActivator<T extends InstanceSource> {
	    invoke(fn: T, args: Object[]): Object;
	}
	export interface IInjectionInfo extends InstanceSource {
	    inject: InstanceKey[] | (() => InstanceKey[]);
	}
	export interface IRegistration {
	    register(container: Container, key: InstanceKey, fn: InstanceSource): void;
	}
	export interface IConstructionInfo {
	    activator: IActivator<any>;
	    keys: InstanceKey[];
	}
	export interface IParameterInfoLocator {
	    (fn: InstanceSource): InstanceKey[];
	}
	export interface IHandler {
	    (container: Container): Object;
	}
	export interface IMetadataKeys {
	    registration: string;
	    instanceActivator: string;
	}

}
declare module 'aurelia-dependency-injection/metadata' {
	import { InstanceKey, InstanceSource, IActivator, IRegistration } from 'aurelia-dependency-injection/interfaces';
	import { Container } from 'aurelia-dependency-injection/container';
	/**
	* Used to allow functions/classes to indicate that they should be registered as transients with the container.
	*
	* @class TransientRegistration
	* @constructor
	* @param {Object} [key] The key to register as.
	*/
	export class TransientRegistration implements IRegistration {
	    key: InstanceKey;
	    constructor(key: InstanceKey);
	    /**
	    * Called by the container to register the annotated function/class as transient.
	    *
	    * @method register
	    * @param {Container} container The container to register with.
	    * @param {Object} key The key to register as.
	    * @param {Object} fn The function to register (target of the annotation).
	    */
	    register(container: Container, key: InstanceKey, fn: InstanceSource): void;
	}
	/**
	* Used to allow functions/classes to indicate that they should be registered as singletons with the container.
	*
	* @class SingletonRegistration
	* @constructor
	* @param {Object} [key] The key to register as.
	*/
	export class SingletonRegistration implements IRegistration {
	    registerInChild: boolean;
	    key: InstanceKey;
	    constructor(registerInChild: boolean);
	    constructor(key: InstanceKey, registerInChild?: boolean);
	    /**
	    * Called by the container to register the annotated function/class as a singleton.
	    *
	    * @method register
	    * @param {Container} container The container to register with.
	    * @param {Object} key The key to register as.
	    * @param {Object} fn The function to register (target of the annotation).
	    */
	    register(container: Container, key: InstanceKey, fn: InstanceSource): void;
	}
	/**
	* An abstract resolver used to allow functions/classes to specify custom dependency resolution logic.
	*
	* @class Resolver
	* @constructor
	*/
	export class Resolver implements InstanceKey {
	    /**
	    * Called by the container to allow custom resolution of dependencies for a function/class.
	    *
	    * @method get
	    * @param {Container} container The container to resolve from.
	    * @return {Object} Returns the resolved object.
	    */
	    get(container: Container): Object;
	}
	/**
	* Used to allow functions/classes to specify lazy resolution logic.
	*
	* @class Lazy
	* @constructor
	* @extends Resolver
	* @param {Object} key The key to lazily resolve.
	*/
	export class Lazy extends Resolver {
	    key: InstanceKey;
	    constructor(key: InstanceKey);
	    /**
	    * Called by the container to lazily resolve the dependency into a lazy locator function.
	    *
	    * @method get
	    * @param {Container} container The container to resolve from.
	    * @return {Function} Returns a function which can be invoked at a later time to obtain the actual dependency.
	    */
	    get(container: Container): () => Object;
	    /**
	    * Creates a Lazy Resolver for the supplied key.
	    *
	    * @method of
	    * @static
	    * @param {Object} key The key to lazily resolve.
	    * @return {Lazy} Returns an insance of Lazy for the key.
	    */
	    static of(key: InstanceKey): Lazy;
	}
	/**
	* Used to allow functions/classes to specify resolution of all matches to a key.
	*
	* @class All
	* @constructor
	* @extends Resolver
	* @param {Object} key The key to lazily resolve all matches for.
	*/
	export class All extends Resolver {
	    key: InstanceKey;
	    constructor(key: InstanceKey);
	    /**
	    * Called by the container to resolve all matching dependencies as an array of instances.
	    *
	    * @method get
	    * @param {Container} container The container to resolve from.
	    * @return {Object[]} Returns an array of all matching instances.
	    */
	    get(container: Container): Object[];
	    /**
	    * Creates an All Resolver for the supplied key.
	    *
	    * @method of
	    * @static
	    * @param {Object} key The key to resolve all instances for.
	    * @return {All} Returns an insance of All for the key.
	    */
	    static of(key: InstanceKey): All;
	}
	/**
	* Used to allow functions/classes to specify an optional dependency, which will be resolved only if already registred with the container.
	*
	* @class Optional
	* @constructor
	* @extends Resolver
	* @param {Object} key The key to optionally resolve for.
	* @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
	*/
	export class Optional extends Resolver {
	    key: InstanceKey;
	    checkParent: boolean;
	    constructor(key: InstanceKey, checkParent?: boolean);
	    /**
	    * Called by the container to provide optional resolution of the key.
	    *
	    * @method get
	    * @param {Container} container The container to resolve from.
	    * @return {Object} Returns the instance if found; otherwise null.
	    */
	    get(container: Container): Object;
	    /**
	    * Creates an Optional Resolver for the supplied key.
	    *
	    * @method of
	    * @static
	    * @param {Object} key The key to optionally resolve for.
	    * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
	    * @return {Optional} Returns an insance of Optional for the key.
	    */
	    static of(key: InstanceKey, checkParent?: boolean): Optional;
	}
	/**
	* Used to inject the dependency from the parent container instead of the current one.
	*
	* @class Parent
	* @constructor
	* @extends Resolver
	* @param {Object} key The key to resolve from the parent container.
	*/
	export class Parent extends Resolver {
	    key: InstanceKey;
	    constructor(key: InstanceKey);
	    /**
	    * Called by the container to load the dependency from the parent container
	    *
	    * @method get
	    * @param {Container} container The container to resolve the parent from.
	    * @return {Function} Returns the matching instance from the parent container
	    */
	    get(container: Container): Object;
	    /**
	    * Creates a Parent Resolver for the supplied key.
	    *
	    * @method of
	    * @static
	    * @param {Object} key The key to resolve.
	    * @return {Parent} Returns an insance of Parent for the key.
	    */
	    static of(key: InstanceKey): Parent;
	}
	/**
	* Used to instantiate a class.
	*
	* @class ClassActivator
	* @constructor
	*/
	export class ClassActivator implements IActivator<new (...args) => Object> {
	    static instance: ClassActivator;
	    invoke(fn: new (...args) => Object, args: Object[]): Object;
	}
	/**
	* Used to invoke a factory method.
	*
	* @class FactoryActivator
	* @constructor
	*/
	export class FactoryActivator implements IActivator<(...args) => Object> {
	    static instance: FactoryActivator;
	    invoke(fn: (...args) => Object, args: Object[]): Object;
	}

}
declare module 'aurelia-dependency-injection/container' {
	import { InstanceKey, InstanceSource, IParameterInfoLocator, IConstructionInfo, IHandler } from 'aurelia-dependency-injection/interfaces';
	export var emptyParameters: InstanceKey[];
	/**
	* A lightweight, extensible dependency injection container.
	*
	* @class Container
	* @constructor
	*/
	export class Container {
	    constructionInfo: Map<InstanceSource, IConstructionInfo>;
	    entries: Map<InstanceKey, IHandler[]>;
	    root: Container;
	    locateParameterInfoElsewhere: IParameterInfoLocator;
	    parent: Container;
	    constructor(constructionInfo?: Map<InstanceSource, IConstructionInfo>);
	    /**
	    * Adds an additional location to search for constructor parameter type info.
	    *
	    * @method addParameterInfoLocator
	    * @param {Function} locator Configures a locator function to use when searching for parameter info. It should return undefined if no parameter info is found.
	    */
	    addParameterInfoLocator(locator: IParameterInfoLocator): void;
	    /**
	    * Registers an existing object instance with the container.
	    *
	    * @method registerInstance
	    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
	    * @param {Object} instance The instance that will be resolved when the key is matched.
	    */
	    registerInstance(key: InstanceKey, instance: Object): void;
	    /**
	    * Registers a type (constructor function) such that the container returns a new instance for each request.
	    *
	    * @method registerTransient
	    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
	    * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
	    */
	    registerTransient(fn: InstanceSource): void;
	    registerTransient(key: InstanceKey, fn: InstanceSource): void;
	    /**
	    * Registers a type (constructor function) such that the container always returns the same instance for each request.
	    *
	    * @method registerSingleton
	    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
	    * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
	    */
	    registerSingleton(fn: InstanceSource): void;
	    registerSingleton(key: InstanceKey, fn: InstanceSource): void;
	    /**
	    * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
	    *
	    * @method autoRegister
	    * @param {Function} fn The constructor function to use when the dependency needs to be instantiated.
	    * @param {Object} [key] The key that identifies the dependency at resolution time; usually a constructor function.
	    */
	    autoRegister(fn: InstanceSource, key?: InstanceKey): void;
	    /**
	    * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
	    *
	    * @method autoRegisterAll
	    * @param {Function[]} fns The constructor function to use when the dependency needs to be instantiated.
	    */
	    autoRegisterAll(fns: InstanceSource[]): void;
	    /**
	    * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
	    *
	    * @method registerHandler
	    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
	    * @param {Function} handler The resolution function to use when the dependency is needed. It will be passed one arguement, the container instance that is invoking it.
	    */
	    registerHandler(key: InstanceKey, handler?: IHandler): void;
	    /**
	    * Unregisters based on key.
	    *
	    * @method unregister
	    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
	    */
	    unregister(key: InstanceKey): void;
	    /**
	    * Resolves a single instance based on the provided key.
	    *
	    * @method get
	    * @param {Object} key The key that identifies the object to resolve.
	    * @return {Object} Returns the resolved instance.
	    */
	    get(key: InstanceKey): Object;
	    /**
	    * Resolves all instance registered under the provided key.
	    *
	    * @method getAll
	    * @param {Object} key The key that identifies the objects to resolve.
	    * @return {Object[]} Returns an array of the resolved instances.
	    */
	    getAll(key: InstanceKey): Object[];
	    /**
	    * Inspects the container to determine if a particular key has been registred.
	    *
	    * @method hasHandler
	    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
	    * @param {Boolean} [checkParent=false] Indicates whether or not to check the parent container hierarchy.
	    * @return {Boolean} Returns true if the key has been registred; false otherwise.
	    */
	    hasHandler(key: InstanceKey, checkParent?: boolean): boolean;
	    /**
	    * Creates a new dependency injection container whose parent is the current container.
	    *
	    * @method createChild
	    * @return {Container} Returns a new container instance parented to this.
	    */
	    createChild(): Container;
	    /**
	    * Invokes a function, recursively resolving its dependencies.
	    *
	    * @method invoke
	    * @param {Function} fn The function to invoke with the auto-resolved dependencies.
	    * @return {Object} Returns the instance resulting from calling the function.
	    */
	    invoke(fn: InstanceSource): Object;
	    getOrCreateEntry(key: InstanceKey): IHandler[];
	    getOrCreateConstructionInfo(fn: InstanceSource): IConstructionInfo;
	    createConstructionInfo(fn: InstanceSource): IConstructionInfo;
	}

}
declare module 'aurelia-dependency-injection/index' {
	import { InstanceKey, InstanceSource, IRegistration, IActivator } from 'aurelia-dependency-injection/interfaces';
	export { IActivator, IInjectionInfo, IRegistration } from 'aurelia-dependency-injection/interfaces';
	/**
	 * A lightweight, extensible dependency injection container for JavaScript.
	 *
	 * @module dependency-injection
	 */
	import { ITypedDecorator } from 'aurelia-metadata';
	export { TransientRegistration, SingletonRegistration, Resolver, Lazy, All, Optional, Parent, ClassActivator, FactoryActivator } from 'aurelia-dependency-injection/metadata';
	export { Container } from 'aurelia-dependency-injection/container';
	export function autoinject(target: Function): void;
	export function autoinject(): ITypedDecorator<Function>;
	export function inject(...rest: InstanceKey[]): ITypedDecorator<InstanceSource>;
	export function registration(value: IRegistration): ITypedDecorator<InstanceSource>;
	export function transient(key?: InstanceKey): ITypedDecorator<InstanceSource>;
	export function singleton(registerInChild: boolean): ITypedDecorator<InstanceSource>;
	export function singleton(key: InstanceKey, registerInChild?: boolean): ITypedDecorator<InstanceSource>;
	export function instanceActivator<T>(value: IActivator<T>): ITypedDecorator<T>;
	export function factory(): ITypedDecorator<(...args) => Object>;

}
declare module 'aurelia-dependency-injection' {
	export * from 'aurelia-dependency-injection/index';
}
