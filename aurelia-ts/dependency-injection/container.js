define(["require", "exports", 'aurelia-metadata', 'aurelia-logging', './metadata'], function (require, exports, aurelia_metadata_1, aurelia_logging_1, metadata_1) {
    aurelia_metadata_1.Metadata.registration = 'aurelia:registration';
    aurelia_metadata_1.Metadata.instanceActivator = 'aurelia:instance-activator';
    // Fix Function#name on browsers that do not support it (IE):
    function test() { }
    if (!test.name) {
        Object.defineProperty(Function.prototype, 'name', {
            get: function () {
                var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
                // For better performance only parse once, and then cache the
                // result through a new accessor for repeated access.
                Object.defineProperty(this, 'name', { value: name });
                return name;
            }
        });
    }
    exports.emptyParameters = Object.freeze([]);
    /**
    * A lightweight, extensible dependency injection container.
    *
    * @class Container
    * @constructor
    */
    var Container = (function () {
        function Container(constructionInfo) {
            this.constructionInfo = constructionInfo || new Map();
            this.entries = new Map();
            this.root = this;
        }
        /**
        * Adds an additional location to search for constructor parameter type info.
        *
        * @method addParameterInfoLocator
        * @param {Function} locator Configures a locator function to use when searching for parameter info. It should return undefined if no parameter info is found.
        */
        Container.prototype.addParameterInfoLocator = function (locator) {
            if (this.locateParameterInfoElsewhere === undefined) {
                this.locateParameterInfoElsewhere = locator;
                return;
            }
            var original = this.locateParameterInfoElsewhere;
            this.locateParameterInfoElsewhere = function (fn) { return original(fn) || locator(fn); };
        };
        /**
        * Registers an existing object instance with the container.
        *
        * @method registerInstance
        * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
        * @param {Object} instance The instance that will be resolved when the key is matched.
        */
        Container.prototype.registerInstance = function (key, instance) {
            this.registerHandler(key, function (x) { return instance; });
        };
        Container.prototype.registerTransient = function (key, fn) {
            fn = fn || key;
            this.registerHandler(key, function (x) { return x.invoke(fn); });
        };
        Container.prototype.registerSingleton = function (key, fn) {
            var singleton = null;
            fn = fn || key;
            this.registerHandler(key, function (x) { return singleton || (singleton = x.invoke(fn)); });
        };
        /**
        * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
        *
        * @method autoRegister
        * @param {Function} fn The constructor function to use when the dependency needs to be instantiated.
        * @param {Object} [key] The key that identifies the dependency at resolution time; usually a constructor function.
        */
        Container.prototype.autoRegister = function (fn, key) {
            var registration;
            if (fn === null || fn === undefined) {
                throw new Error('fn cannot be null or undefined.');
            }
            registration = aurelia_metadata_1.Metadata.get(aurelia_metadata_1.Metadata.registration, fn);
            if (registration !== undefined) {
                registration.register(this, key || fn, fn);
            }
            else {
                this.registerSingleton(key || fn, fn);
            }
        };
        /**
        * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
        *
        * @method autoRegisterAll
        * @param {Function[]} fns The constructor function to use when the dependency needs to be instantiated.
        */
        Container.prototype.autoRegisterAll = function (fns) {
            var i = fns.length;
            while (i--) {
                this.autoRegister(fns[i]);
            }
        };
        /**
        * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
        *
        * @method registerHandler
        * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
        * @param {Function} handler The resolution function to use when the dependency is needed. It will be passed one arguement, the container instance that is invoking it.
        */
        Container.prototype.registerHandler = function (key, handler) {
            this.getOrCreateEntry(key).push(handler);
        };
        /**
        * Unregisters based on key.
        *
        * @method unregister
        * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
        */
        Container.prototype.unregister = function (key) {
            this.entries.delete(key);
        };
        /**
        * Resolves a single instance based on the provided key.
        *
        * @method get
        * @param {Object} key The key that identifies the object to resolve.
        * @return {Object} Returns the resolved instance.
        */
        Container.prototype.get = function (key) {
            var entry;
            if (key === null || key === undefined) {
                throw new Error('key cannot be null or undefined.');
            }
            if (key === Container) {
                return this;
            }
            if (key instanceof metadata_1.Resolver) {
                return key.get(this);
            }
            entry = this.entries.get(key);
            if (entry !== undefined) {
                return entry[0](this);
            }
            if (this.parent) {
                return this.parent.get(key);
            }
            this.autoRegister(key);
            entry = this.entries.get(key);
            return entry[0](this);
        };
        /**
        * Resolves all instance registered under the provided key.
        *
        * @method getAll
        * @param {Object} key The key that identifies the objects to resolve.
        * @return {Object[]} Returns an array of the resolved instances.
        */
        Container.prototype.getAll = function (key) {
            var _this = this;
            var entry;
            if (key === null || key === undefined) {
                throw new Error('key cannot be null or undefined.');
            }
            entry = this.entries.get(key);
            if (entry !== undefined) {
                return entry.map(function (x) { return x(_this); });
            }
            if (this.parent) {
                return this.parent.getAll(key);
            }
            return [];
        };
        /**
        * Inspects the container to determine if a particular key has been registred.
        *
        * @method hasHandler
        * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
        * @param {Boolean} [checkParent=false] Indicates whether or not to check the parent container hierarchy.
        * @return {Boolean} Returns true if the key has been registred; false otherwise.
        */
        Container.prototype.hasHandler = function (key, checkParent) {
            if (checkParent === void 0) { checkParent = false; }
            if (key === null || key === undefined) {
                throw new Error('key cannot be null or undefined.');
            }
            return this.entries.has(key)
                || (checkParent && this.parent && this.parent.hasHandler(key, checkParent));
        };
        /**
        * Creates a new dependency injection container whose parent is the current container.
        *
        * @method createChild
        * @return {Container} Returns a new container instance parented to this.
        */
        Container.prototype.createChild = function () {
            var childContainer = new Container(this.constructionInfo);
            childContainer.parent = this;
            childContainer.root = this.root;
            childContainer.locateParameterInfoElsewhere = this.locateParameterInfoElsewhere;
            return childContainer;
        };
        /**
        * Invokes a function, recursively resolving its dependencies.
        *
        * @method invoke
        * @param {Function} fn The function to invoke with the auto-resolved dependencies.
        * @return {Object} Returns the instance resulting from calling the function.
        */
        Container.prototype.invoke = function (fn) {
            try {
                var info = this.getOrCreateConstructionInfo(fn), keys = info.keys, args = new Array(keys.length), i, ii;
                for (i = 0, ii = keys.length; i < ii; ++i) {
                    args[i] = this.get(keys[i]);
                }
                return info.activator.invoke(fn, args);
            }
            catch (e) {
                throw aurelia_logging_1.AggregateError("Error instantiating " + fn.name + ".", e, true);
            }
        };
        Container.prototype.getOrCreateEntry = function (key) {
            var entry;
            if (key === null || key === undefined) {
                throw new Error('key cannot be null or undefined.');
            }
            entry = this.entries.get(key);
            if (entry === undefined) {
                entry = [];
                this.entries.set(key, entry);
            }
            return entry;
        };
        Container.prototype.getOrCreateConstructionInfo = function (fn) {
            var info = this.constructionInfo.get(fn);
            if (info === undefined) {
                info = this.createConstructionInfo(fn);
                this.constructionInfo.set(fn, info);
            }
            return info;
        };
        Container.prototype.createConstructionInfo = function (fn) {
            var info = { activator: aurelia_metadata_1.Metadata.getOwn(aurelia_metadata_1.Metadata.instanceActivator, fn) || metadata_1.ClassActivator.instance };
            if (fn.inject !== undefined) {
                if (typeof fn.inject === 'function') {
                    info.keys = fn.inject();
                }
                else {
                    info.keys = fn.inject;
                }
                return info;
            }
            if (this.locateParameterInfoElsewhere !== undefined) {
                info.keys = this.locateParameterInfoElsewhere(fn) || Reflect.getOwnMetadata(aurelia_metadata_1.Metadata.paramTypes, fn) || exports.emptyParameters;
            }
            else {
                info.keys = Reflect.getOwnMetadata(aurelia_metadata_1.Metadata.paramTypes, fn) || exports.emptyParameters;
            }
            return info;
        };
        return Container;
    })();
    exports.Container = Container;
});
