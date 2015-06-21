import {IMetadataKeys, InstanceKey, InstanceSource, IInjectionInfo, IParameterInfoLocator, IConstructionInfo, IHandler, IRegistration} from './interfaces';

import core from 'core-js';
import {Metadata} from 'aurelia-metadata';
import {AggregateError} from 'aurelia-logging';
import {Resolver, ClassActivator} from './metadata';

(<IMetadataKeys><any>Metadata).registration = 'aurelia:registration';
(<IMetadataKeys><any>Metadata).instanceActivator = 'aurelia:instance-activator';

// Fix Function#name on browsers that do not support it (IE):
function test() { }
if (!test.name) {
    Object.defineProperty(Function.prototype, 'name', {
        get: function () {
            var name = (<Function>this).toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
            // For better performance only parse once, and then cache the
            // result through a new accessor for repeated access.
            Object.defineProperty(<Function>this, 'name', { value: name });
            return name;
        }
    });
}

export var emptyParameters: InstanceKey[] = Object.freeze([]);


/**
* A lightweight, extensible dependency injection container.
*
* @class Container
* @constructor
*/
export class Container implements Container {
    public constructionInfo: Map<InstanceSource, IConstructionInfo>;
    public entries: Map<InstanceKey, IHandler[]>;
    public root: Container;
    public locateParameterInfoElsewhere: IParameterInfoLocator;
    public parent: Container;
    constructor(constructionInfo?: Map<InstanceSource, IConstructionInfo>) {
        this.constructionInfo = constructionInfo || new Map<InstanceSource, IConstructionInfo>();
        this.entries = new Map<InstanceKey, IHandler[]>();
        this.root = this;
    }

    /**
    * Adds an additional location to search for constructor parameter type info.
    *
    * @method addParameterInfoLocator
    * @param {Function} locator Configures a locator function to use when searching for parameter info. It should return undefined if no parameter info is found.
    */
    addParameterInfoLocator(locator: IParameterInfoLocator): void {
        if (this.locateParameterInfoElsewhere === undefined) {
            this.locateParameterInfoElsewhere = locator;
            return;
        }

        var original = this.locateParameterInfoElsewhere;
        this.locateParameterInfoElsewhere = (fn) => { return original(fn) || locator(fn); };
    }

    /**
    * Registers an existing object instance with the container.
    *
    * @method registerInstance
    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
    * @param {Object} instance The instance that will be resolved when the key is matched.
    */
    registerInstance(key: InstanceKey, instance: Object): void {
        this.registerHandler(key, x => instance);
    }

    /**
    * Registers a type (constructor function) such that the container returns a new instance for each request.
    *
    * @method registerTransient
    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
    * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
    */
    registerTransient(fn: InstanceSource): void;
    registerTransient(key: InstanceKey, fn: InstanceSource): void;
    registerTransient(key: InstanceKey, fn?: InstanceSource): void {
        fn = fn || <any>key;
        this.registerHandler(key, x => x.invoke(fn));
    }

    /**
    * Registers a type (constructor function) such that the container always returns the same instance for each request.
    *
    * @method registerSingleton
    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
    * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
    */
    registerSingleton(fn: InstanceSource): void;
    registerSingleton(key: InstanceKey, fn: InstanceSource): void;
    registerSingleton(key: InstanceKey, fn?: InstanceSource): void {
        var singleton: Object = null;
        fn = fn || <any>key;
        this.registerHandler(key, x => singleton || (singleton = x.invoke(fn)));
    }

    /**
    * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
    *
    * @method autoRegister
    * @param {Function} fn The constructor function to use when the dependency needs to be instantiated.
    * @param {Object} [key] The key that identifies the dependency at resolution time; usually a constructor function.
    */
    autoRegister(fn: InstanceSource, key?: InstanceKey): void {
        var registration: IRegistration;

        if (fn === null || fn === undefined) {
            throw new Error('fn cannot be null or undefined.')
        }

        registration = Metadata.get((<IMetadataKeys><any>Metadata).registration, fn);

        if (registration !== undefined) {
            registration.register(this, key || fn, fn);
        } else {
            this.registerSingleton(key || fn, fn);
        }
    }

    /**
    * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
    *
    * @method autoRegisterAll
    * @param {Function[]} fns The constructor function to use when the dependency needs to be instantiated.
    */
    autoRegisterAll(fns: InstanceSource[]): void {
        var i = fns.length;
        while (i--) {
            this.autoRegister(fns[i]);
        }
    }

    /**
    * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
    *
    * @method registerHandler
    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
    * @param {Function} handler The resolution function to use when the dependency is needed. It will be passed one arguement, the container instance that is invoking it.
    */
    registerHandler(key: InstanceKey, handler?: IHandler): void {
        this.getOrCreateEntry(key).push(handler);
    }

    /**
    * Unregisters based on key.
    *
    * @method unregister
    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
    */
    unregister(key: InstanceKey): void {
        this.entries.delete(key);
    }

    /**
    * Resolves a single instance based on the provided key.
    *
    * @method get
    * @param {Object} key The key that identifies the object to resolve.
    * @return {Object} Returns the resolved instance.
    */
    get(key: InstanceKey): Object {
        var entry: IHandler[];

        if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.');
        }

        if (key === Container) {
            return this;
        }

        if (key instanceof Resolver) {
            return (<Resolver>key).get(this);
        }

        entry = this.entries.get(key);

        if (entry !== undefined) {
            return entry[0](this);
        }

        if (this.parent) {
            return this.parent.get(key);
        }

        this.autoRegister(<InstanceSource>key);
        entry = this.entries.get(key);

        return entry[0](this);
    }

    /**
    * Resolves all instance registered under the provided key.
    *
    * @method getAll
    * @param {Object} key The key that identifies the objects to resolve.
    * @return {Object[]} Returns an array of the resolved instances.
    */
    getAll(key: InstanceKey): Object[] {
        var entry: IHandler[];

        if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.');
        }

        entry = this.entries.get(key);

        if (entry !== undefined) {
            return entry.map(x => x(this));
        }

        if (this.parent) {
            return this.parent.getAll(key);
        }

        return [];
    }

    /**
    * Inspects the container to determine if a particular key has been registred.
    *
    * @method hasHandler
    * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
    * @param {Boolean} [checkParent=false] Indicates whether or not to check the parent container hierarchy.
    * @return {Boolean} Returns true if the key has been registred; false otherwise.
    */
    hasHandler(key: InstanceKey, checkParent: boolean = false): boolean {
        if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.');
        }

        return this.entries.has(key)
            || (checkParent && this.parent && this.parent.hasHandler(key, checkParent));
    }

    /**
    * Creates a new dependency injection container whose parent is the current container.
    *
    * @method createChild
    * @return {Container} Returns a new container instance parented to this.
    */
    createChild(): Container {
        var childContainer = new Container(this.constructionInfo);
        childContainer.parent = this;
        childContainer.root = this.root;
        childContainer.locateParameterInfoElsewhere = this.locateParameterInfoElsewhere;
        return childContainer;
    }

    /**
    * Invokes a function, recursively resolving its dependencies.
    *
    * @method invoke
    * @param {Function} fn The function to invoke with the auto-resolved dependencies.
    * @return {Object} Returns the instance resulting from calling the function.
    */
    invoke(fn: InstanceSource): Object {
        try {
            var info = this.getOrCreateConstructionInfo(fn),
                keys = info.keys,
                args: Object[] = new Array(keys.length),
                i: number, ii: number;

            for (i = 0, ii = keys.length; i < ii; ++i) {
                args[i] = this.get(keys[i]);
            }

            return info.activator.invoke(fn, args);
        } catch (e) {
            throw AggregateError(`Error instantiating ${(<any>fn).name}.`, e, true);
        }
    }

    getOrCreateEntry(key: InstanceKey): IHandler[] {
        var entry: IHandler[];

        if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.');
        }

        entry = this.entries.get(key);

        if (entry === undefined) {
            entry = [];
            this.entries.set(key, entry);
        }

        return entry;
    }

    getOrCreateConstructionInfo(fn: InstanceSource): IConstructionInfo {
        var info = this.constructionInfo.get(fn);

        if (info === undefined) {
            info = this.createConstructionInfo(fn);
            this.constructionInfo.set(fn, info);
        }

        return info;
    }

    createConstructionInfo(fn: InstanceSource): IConstructionInfo {
        var info: IConstructionInfo = <IConstructionInfo>{ activator: Metadata.getOwn((<IMetadataKeys><any>Metadata).instanceActivator, fn) || ClassActivator.instance };

        if ((<IInjectionInfo>fn).inject !== undefined) {
            if (typeof (<IInjectionInfo>fn).inject === 'function') {
                info.keys = (<() => InstanceKey[]>(<IInjectionInfo>fn).inject)();
            } else {
                info.keys = <InstanceKey[]>(<IInjectionInfo>fn).inject;
            }

            return info;
        }

        if (this.locateParameterInfoElsewhere !== undefined) {
            info.keys = this.locateParameterInfoElsewhere(fn) || Reflect.getOwnMetadata(Metadata.paramTypes, fn) || emptyParameters;
        } else {
            info.keys = Reflect.getOwnMetadata(Metadata.paramTypes, fn) || emptyParameters;
        }

        return info;
    }
}
