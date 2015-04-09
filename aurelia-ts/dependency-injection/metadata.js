var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var __decorate = this.__decorate || (typeof Reflect === "object" && Reflect.decorate) || function (decorators, target, key, desc) {
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
define(["require", "exports"], function (require, exports) {
    /**
    * Used to allow functions/classes to indicate how they should be registered with the container.
    *
    * @class Registration
    * @constructor
    */
    var Registration = (function () {
        function Registration() {
        }
        /**
        * Called by the container to allow custom registration logic for the annotated function/class.
        *
        * @method register
        * @param {Container} container The container to register with.
        * @param {Object} key The key to register as.
        * @param {Object} fn The function to register (target of the annotation).
        */
        Registration.prototype.register = function (container, key, fn) {
            throw new Error('A custom Registration must implement register(container, key, fn).');
        };
        return Registration;
    })();
    exports.Registration = Registration;
    /**
    * Used to allow functions/classes to indicate that they should be registered as transients with the container.
    *
    * @class TransientRegistration
    * @constructor
    * @extends Registration
    * @param {Object} [key] The key to register as.
    */
    var TransientRegistration = (function (_super) {
        __extends(TransientRegistration, _super);
        function TransientRegistration(key) {
            _super.call(this);
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
        TransientRegistration.prototype.register = function (container, key, fn) {
            container.registerTransient(this.key || key, fn);
        };
        return TransientRegistration;
    })(Registration);
    exports.TransientRegistration = TransientRegistration;
    /**
    * Used to allow functions/classes to indicate that they should be registered as singletons with the container.
    *
    * @class SingletonRegistration
    * @constructor
    * @extends Registration
    * @param {Object} [key] The key to register as.
    */
    var SingletonRegistration = (function (_super) {
        __extends(SingletonRegistration, _super);
        function SingletonRegistration(keyOrRegisterInChild, registerInChild) {
            if (registerInChild === void 0) { registerInChild = false; }
            _super.call(this);
            if (typeof keyOrRegisterInChild === 'boolean') {
                this.registerInChild = keyOrRegisterInChild;
            }
            else {
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
        SingletonRegistration.prototype.register = function (container, key, fn) {
            var destination = this.registerInChild ? container : container.root;
            destination.registerSingleton(this.key || key, fn);
        };
        return SingletonRegistration;
    })(Registration);
    exports.SingletonRegistration = SingletonRegistration;
    /**
    * An abstract resolver used to allow functions/classes to specify custom dependency resolution logic.
    *
    * @class Resolver
    * @constructor
    */
    var Resolver = (function () {
        function Resolver() {
        }
        /**
        * Called by the container to allow custom resolution of dependencies for a function/class.
        *
        * @method get
        * @param {Container} container The container to resolve from.
        * @return {Object} Returns the resolved object.
        */
        Resolver.prototype.get = function (container) {
            throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
        };
        return Resolver;
    })();
    exports.Resolver = Resolver;
    /**
    * Used to allow functions/classes to specify lazy resolution logic.
    *
    * @class Lazy
    * @constructor
    * @extends Resolver
    * @param {Object} key The key to lazily resolve.
    */
    var Lazy = (function (_super) {
        __extends(Lazy, _super);
        function Lazy(key) {
            _super.call(this);
            this.key = key;
        }
        /**
        * Called by the container to lazily resolve the dependency into a lazy locator function.
        *
        * @method get
        * @param {Container} container The container to resolve from.
        * @return {Function} Returns a function which can be invoked at a later time to obtain the actual dependency.
        */
        Lazy.prototype.get = function (container) {
            var _this = this;
            return function () {
                return container.get(_this.key);
            };
        };
        /**
        * Creates a Lazy Resolver for the supplied key.
        *
        * @method of
        * @static
        * @param {Object} key The key to lazily resolve.
        * @return {Lazy} Returns an insance of Lazy for the key.
        */
        Lazy.of = function (key) {
            return new Lazy(key);
        };
        return Lazy;
    })(Resolver);
    exports.Lazy = Lazy;
    /**
    * Used to allow functions/classes to specify resolution of all matches to a key.
    *
    * @class All
    * @constructor
    * @extends Resolver
    * @param {Object} key The key to lazily resolve all matches for.
    */
    var All = (function (_super) {
        __extends(All, _super);
        function All(key) {
            _super.call(this);
            this.key = key;
        }
        /**
        * Called by the container to resolve all matching dependencies as an array of instances.
        *
        * @method get
        * @param {Container} container The container to resolve from.
        * @return {Object[]} Returns an array of all matching instances.
        */
        All.prototype.get = function (container) {
            return container.getAll(this.key);
        };
        /**
        * Creates an All Resolver for the supplied key.
        *
        * @method of
        * @static
        * @param {Object} key The key to resolve all instances for.
        * @return {All} Returns an insance of All for the key.
        */
        All.of = function (key) {
            return new All(key);
        };
        return All;
    })(Resolver);
    exports.All = All;
    /**
    * Used to allow functions/classes to specify an optional dependency, which will be resolved only if already registred with the container.
    *
    * @class Optional
    * @constructor
    * @extends Resolver
    * @param {Object} key The key to optionally resolve for.
    * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
    */
    var Optional = (function (_super) {
        __extends(Optional, _super);
        function Optional(key, checkParent) {
            if (checkParent === void 0) { checkParent = false; }
            _super.call(this);
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
        Optional.prototype.get = function (container) {
            if (container.hasHandler(this.key, this.checkParent)) {
                return container.get(this.key);
            }
            return null;
        };
        /**
        * Creates an Optional Resolver for the supplied key.
        *
        * @method of
        * @static
        * @param {Object} key The key to optionally resolve for.
        * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
        * @return {Optional} Returns an insance of Optional for the key.
        */
        Optional.of = function (key, checkParent) {
            if (checkParent === void 0) { checkParent = false; }
            return new Optional(key, checkParent);
        };
        return Optional;
    })(Resolver);
    exports.Optional = Optional;
    /**
    * Used to inject the dependency from the parent container instead of the current one.
    *
    * @class Parent
    * @constructor
    * @extends Resolver
    * @param {Object} key The key to resolve from the parent container.
    */
    var Parent = (function (_super) {
        __extends(Parent, _super);
        function Parent(key) {
            _super.call(this);
            this.key = key;
        }
        /**
        * Called by the container to load the dependency from the parent container
        *
        * @method get
        * @param {Container} container The container to resolve the parent from.
        * @return {Function} Returns the matching instance from the parent container
        */
        Parent.prototype.get = function (container) {
            return container.parent
                ? container.parent.get(this.key)
                : null;
        };
        /**
        * Creates a Parent Resolver for the supplied key.
        *
        * @method of
        * @static
        * @param {Object} key The key to resolve.
        * @return {Parent} Returns an insance of Parent for the key.
        */
        Parent.of = function (key) {
            return new Parent(key);
        };
        return Parent;
    })(Resolver);
    exports.Parent = Parent;
    /**
    * Used to construct instances.
    *
    * @class InstanceActivator
    * @constructor
    */
    var InstanceActivator = (function () {
        function InstanceActivator() {
        }
        InstanceActivator.prototype.invoke = function (fn, args) {
            throw new Error('A custom Activator must implement invoke(fn, args).');
        };
        return InstanceActivator;
    })();
    exports.InstanceActivator = InstanceActivator;
    /**
    * Used to instantiate a class.
    *
    * @class ClassActivator
    * @constructor
    */
    var ClassActivator = (function (_super) {
        __extends(ClassActivator, _super);
        function ClassActivator() {
            _super.apply(this, arguments);
        }
        ClassActivator.prototype.invoke = function (fn, args) {
            return Reflect.construct(fn, args);
        };
        return ClassActivator;
    })(InstanceActivator);
    exports.ClassActivator = ClassActivator;
    /**
    * Used to invoke a factory method.
    *
    * @class FactoryActivator
    * @constructor
    */
    var FactoryActivator = (function (_super) {
        __extends(FactoryActivator, _super);
        function FactoryActivator() {
            _super.apply(this, arguments);
        }
        FactoryActivator.prototype.invoke = function (fn, args) {
            return fn.apply(undefined, args);
        };
        return FactoryActivator;
    })(InstanceActivator);
    exports.FactoryActivator = FactoryActivator;
});
