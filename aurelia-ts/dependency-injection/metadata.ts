import {InstanceKey, InstanceSource, IActivator, IRegistration} from './interfaces';
import {Container} from './container';

import core from 'core-js';

/**
* Used to allow functions/classes to indicate that they should be registered as transients with the container.
*
* @class TransientRegistration
* @constructor
* @param {Object} [key] The key to register as.
*/
export class TransientRegistration implements IRegistration {
    key: InstanceKey;
    constructor(key: InstanceKey) {
        this.key = key;
    }

    /**
    * Called by the container to register the annotated function/class as transient.
    *
    * @method register
    * @param {Container} container The container to register with.
    * @param {Object} key The key to register as.
    * @param {Object} fn The function to register (target of the annotation).
    */
    register(container: Container, key: InstanceKey, fn: InstanceSource): void {
        container.registerTransient(this.key || key, fn);
    }
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
    constructor(keyOrRegisterInChild: InstanceKey | boolean, registerInChild: boolean = false) {
        if (typeof keyOrRegisterInChild === 'boolean') {
            this.registerInChild = keyOrRegisterInChild;
        } else {
            this.key = keyOrRegisterInChild;
            this.registerInChild = registerInChild;
        }
    }

    /**
    * Called by the container to register the annotated function/class as a singleton.
    *
    * @method register
    * @param {Container} container The container to register with.
    * @param {Object} key The key to register as.
    * @param {Object} fn The function to register (target of the annotation).
    */
    register(container: Container, key: InstanceKey, fn: InstanceSource): void {
        var destination = this.registerInChild ? container : container.root;
        destination.registerSingleton(this.key || key, fn);
    }
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
    get(container: Container): Object {
        throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
    }
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
    constructor(key: InstanceKey) {
        super();
        this.key = key;
    }

    /**
    * Called by the container to lazily resolve the dependency into a lazy locator function.
    *
    * @method get
    * @param {Container} container The container to resolve from.
    * @return {Function} Returns a function which can be invoked at a later time to obtain the actual dependency.
    */
    get(container: Container): () => Object {
        return () => {
            return container.get(this.key);
        };
    }

    /**
    * Creates a Lazy Resolver for the supplied key.
    *
    * @method of
    * @static
    * @param {Object} key The key to lazily resolve.
    * @return {Lazy} Returns an insance of Lazy for the key.
    */
    static of(key: InstanceKey): Lazy {
        return new Lazy(key);
    }
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
    constructor(key: InstanceKey) {
        super();
        this.key = key;
    }

    /**
    * Called by the container to resolve all matching dependencies as an array of instances.
    *
    * @method get
    * @param {Container} container The container to resolve from.
    * @return {Object[]} Returns an array of all matching instances.
    */
    get(container: Container): Object[] {
        return container.getAll(this.key);
    }

    /**
    * Creates an All Resolver for the supplied key.
    *
    * @method of
    * @static
    * @param {Object} key The key to resolve all instances for.
    * @return {All} Returns an insance of All for the key.
    */
    static of(key: InstanceKey): All {
        return new All(key);
    }
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
    constructor(key: InstanceKey, checkParent: boolean = false) {
        super();
        this.key = key;
        this.checkParent = checkParent;
    }

    /**
    * Called by the container to provide optional resolution of the key.
    *
    * @method get
    * @param {Container} container The container to resolve from.
    * @return {Object} Returns the instance if found; otherwise null.
    */
    get(container: Container): Object {
        if (container.hasHandler(this.key, this.checkParent)) {
            return container.get(this.key);
        }

        return null;
    }

    /**
    * Creates an Optional Resolver for the supplied key.
    *
    * @method of
    * @static
    * @param {Object} key The key to optionally resolve for.
    * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
    * @return {Optional} Returns an insance of Optional for the key.
    */
    static of(key: InstanceKey, checkParent: boolean = false): Optional {
        return new Optional(key, checkParent);
    }
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
    constructor(key: InstanceKey) {
        super();
        this.key = key;
    }

    /**
    * Called by the container to load the dependency from the parent container
    *
    * @method get
    * @param {Container} container The container to resolve the parent from.
    * @return {Function} Returns the matching instance from the parent container
    */
    get(container: Container): Object {
        return container.parent
            ? container.parent.get(this.key)
            : null;
    }

    /**
    * Creates a Parent Resolver for the supplied key.
    *
    * @method of
    * @static
    * @param {Object} key The key to resolve.
    * @return {Parent} Returns an insance of Parent for the key.
    */
    static of(key: InstanceKey): Parent {
        return new Parent(key);
    }
}

/**
* Used to instantiate a class.
*
* @class ClassActivator
* @constructor
*/
export class ClassActivator implements IActivator<new (...args) => Object> {
    static instance = new ClassActivator();

    invoke(fn: new (...args) => Object, args: Object[]): Object {
        return Reflect.construct(fn, args);
    }
}

/**
* Used to invoke a factory method.
*
* @class FactoryActivator
* @constructor
*/
export class FactoryActivator implements IActivator<(...args) => Object> {
    static instance = new FactoryActivator();

    invoke(fn: (...args) => Object, args: Object[]): Object {
        return fn.apply(undefined, args);
    }
}
