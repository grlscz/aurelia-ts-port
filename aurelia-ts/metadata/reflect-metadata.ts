import core from 'core-js';

// Load global or shim versions of Map, Set, and WeakMap
var functionPrototype = Object.getPrototypeOf(Function);
var _Map = Map;
var _Set = Set;
var _WeakMap = WeakMap;

// [[Metadata]] internal slot
var __Metadata__ = new _WeakMap<Object, Map<string | symbol, Map<any, any>>>();

function decorate(decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[], target: Object | Function, targetKey: string | symbol, targetDescriptor: PropertyDescriptor): Function | PropertyDescriptor {
    if (!IsUndefined(targetDescriptor)) {
        if (!IsArray(decorators)) {
            throw new TypeError();
        }
        else if (!IsObject(target)) {
            throw new TypeError();
        }
        else if (IsUndefined(targetKey)) {
            throw new TypeError();
        }
        else if (!IsObject(targetDescriptor)) {
            throw new TypeError();
        }
        targetKey = ToPropertyKey(targetKey);
        return DecoratePropertyWithDescriptor(<MethodDecorator[]>decorators, <Object>target, targetKey, targetDescriptor);
    }
    else if (!IsUndefined(targetKey)) {
        if (!IsArray(decorators)) {
            throw new TypeError();
        }
        else if (!IsObject(target)) {
            throw new TypeError();
        }
        targetKey = ToPropertyKey(targetKey);
        return DecoratePropertyWithoutDescriptor(<PropertyDecorator[]>decorators, <Object>target, targetKey);
    }
    else {
        if (!IsArray(decorators)) {
            throw new TypeError();
        }
        else if (!IsConstructor(target)) {
            throw new TypeError();
        }
        return DecorateConstructor(<ClassDecorator[]>decorators, <Function>target);
    }
}
Reflect.decorate = <typeof Reflect.decorate>decorate;

function metadata(metadataKey: any, metadataValue: any): ClassDecorator | MethodDecorator | PropertyDecorator {
    function decorator(target: Object | Function, targetKey: string | symbol) {
        if (!IsUndefined(targetKey)) {
            if (!IsObject(target)) {
                throw new TypeError();
            }
            targetKey = ToPropertyKey(targetKey);
            OrdinaryDefineOwnMetadata(metadataKey, metadataValue, <Object>target, targetKey);
        }
        else {
            if (!IsConstructor(target)) {
                throw new TypeError();
            }
            OrdinaryDefineOwnMetadata(metadataKey, metadataValue, <Function>target, undefined);
        }
    }
    return decorator;
}
Reflect.metadata = metadata;

function defineMetadata(metadataKey: any, metadataValue: any, target: Object, targetKey: string | symbol) {
    if (!IsObject(target)) {
        throw new TypeError();
    }
    else if (!IsUndefined(targetKey)) {
        targetKey = ToPropertyKey(targetKey);
    }
    return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey);
}
Reflect.defineMetadata = <typeof Reflect.defineMetadata>defineMetadata;

function hasMetadata(metadataKey: any, target: Object, targetKey: string | symbol) {
    if (!IsObject(target)) {
        throw new TypeError();
    }
    else if (!IsUndefined(targetKey)) {
        targetKey = ToPropertyKey(targetKey);
    }
    return OrdinaryHasMetadata(metadataKey, target, targetKey);
}
Reflect.hasMetadata = <typeof Reflect.hasMetadata>hasMetadata;

function hasOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol) {
    if (!IsObject(target)) {
        throw new TypeError();
    }
    else if (!IsUndefined(targetKey)) {
        targetKey = ToPropertyKey(targetKey);
    }
    return OrdinaryHasOwnMetadata(metadataKey, target, targetKey);
}
Reflect.hasOwnMetadata = <typeof Reflect.hasOwnMetadata>hasOwnMetadata;

function getMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any {
    if (!IsObject(target)) {
        throw new TypeError();
    }
    else if (!IsUndefined(targetKey)) {
        targetKey = ToPropertyKey(targetKey);
    }
    return OrdinaryGetMetadata(metadataKey, target, targetKey);
}
Reflect.getMetadata = <typeof Reflect.getMetadata>getMetadata;

function getOwnMetadata(metadataKey: any, target: Object, targetKey: string | symbol): any {
    if (!IsObject(target)) {
        throw new TypeError();
    }
    else if (!IsUndefined(targetKey)) {
        targetKey = ToPropertyKey(targetKey);
    }
    return OrdinaryGetOwnMetadata(metadataKey, target, targetKey);
}
Reflect.getOwnMetadata = <typeof Reflect.getOwnMetadata>getOwnMetadata;

function getMetadataKeys(target: Object, targetKey: string | symbol): any[] {
    if (!IsObject(target)) {
        throw new TypeError();
    }
    else if (!IsUndefined(targetKey)) {
        targetKey = ToPropertyKey(targetKey);
    }
    return OrdinaryMetadataKeys(target, targetKey);
}
Reflect.getMetadataKeys = <typeof Reflect.getMetadataKeys>getMetadataKeys;

function getOwnMetadataKeys(target: Object, targetKey: string | symbol): any[] {
    if (!IsObject(target)) {
        throw new TypeError();
    }
    else if (!IsUndefined(targetKey)) {
        targetKey = ToPropertyKey(targetKey);
    }
    return OrdinaryOwnMetadataKeys(target, targetKey);
}
Reflect.getOwnMetadataKeys = <typeof Reflect.getOwnMetadataKeys>getOwnMetadataKeys;

function deleteMetadata(metadataKey: any, target: Object, targetKey: string | symbol): boolean {
    if (!IsObject(target)) {
        throw new TypeError();
    }
    else if (!IsUndefined(targetKey)) {
        targetKey = ToPropertyKey(targetKey);
    }
    // https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#deletemetadata-metadatakey-p-
    var metadataMap = GetOrCreateMetadataMap(target, targetKey, false);
    if (IsUndefined(metadataMap)) {
        return false;
    }
    if (!metadataMap.delete(metadataKey)) {
        return false;
    }
    if (metadataMap.size > 0) {
        return true;
    }
    var targetMetadata: any = __Metadata__.get(target);
    targetMetadata.delete(targetKey);
    if (targetMetadata.size > 0) {
        return true;
    }
    __Metadata__.delete(target);
    return true;
}
(<any>Reflect).deleteMetadata = deleteMetadata;

function DecorateConstructor(decorators: ClassDecorator[], target: Function): Function {
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target);
        if (!IsUndefined(decorated)) {
            if (!IsConstructor(decorated)) {
                throw new TypeError();
            }
            target = <Function>decorated;
        }
    }
    return target;
}
function DecoratePropertyWithDescriptor(decorators: MethodDecorator[], target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target, propertyKey, descriptor);
        if (!IsUndefined(decorated)) {
            if (!IsObject(decorated)) {
                throw new TypeError();
            }
            descriptor = <PropertyDescriptor>decorated;
        }
    }
    return descriptor;
}
function DecoratePropertyWithoutDescriptor(decorators: PropertyDecorator[], target: Object, propertyKey: string | symbol): any {
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        decorator(target, propertyKey);
    }
}
// https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#getorcreatemetadatamap--o-p-create-
function GetOrCreateMetadataMap(target: Object, targetKey: string | symbol, create: boolean): Map<any, any> {
    var targetMetadata: Map<string | symbol, Map<any, any>> = __Metadata__.get(target);
    if (!targetMetadata) {
        if (!create) {
            return undefined;
        }
        targetMetadata = new _Map<string | symbol, Map<any, any>>();
        __Metadata__.set(target, targetMetadata);
    }
    var keyMetadata: Map<any, any> = targetMetadata.get(targetKey);
    if (!keyMetadata) {
        if (!create) {
            return undefined;
        }
        keyMetadata = new _Map<any, any>();
        targetMetadata.set(targetKey, keyMetadata);
    }
    return keyMetadata;
}
// https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinaryhasmetadata--metadatakey-o-p-
function OrdinaryHasMetadata(MetadataKey: any, O: Object, P: string | symbol): boolean {
    var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
    if (hasOwn) {
        return true;
    }
    var parent = GetPrototypeOf(O);
    if (parent !== null) {
        return OrdinaryHasMetadata(MetadataKey, parent, P);
    }
    return false;
}
// https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinaryhasownmetadata--metadatakey-o-p-
function OrdinaryHasOwnMetadata(MetadataKey: any, O: Object, P: string | symbol): boolean {
    var metadataMap = GetOrCreateMetadataMap(O, P, false);
    if (metadataMap === undefined) {
        return false;
    }
    return Boolean(metadataMap.has(MetadataKey));
}
// https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinarygetmetadata--metadatakey-o-p-
function OrdinaryGetMetadata(MetadataKey: any, O: Object, P: string | symbol): any {
    var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
    if (hasOwn) {
        return OrdinaryGetOwnMetadata(MetadataKey, O, P);
    }
    var parent = GetPrototypeOf(O);
    if (parent !== null) {
        return OrdinaryGetMetadata(MetadataKey, parent, P);
    }
    return undefined;
}
// https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinarygetownmetadata--metadatakey-o-p-
function OrdinaryGetOwnMetadata(MetadataKey: any, O: Object, P: string | symbol): any {
    var metadataMap = GetOrCreateMetadataMap(O, P, false);
    if (metadataMap === undefined) {
        return undefined;
    }
    return metadataMap.get(MetadataKey);
}
// https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinarydefineownmetadata--metadatakey-metadatavalue-o-p-
function OrdinaryDefineOwnMetadata(MetadataKey: any, MetadataValue: any, O: Object | Function, P: string | symbol): void {
    var metadataMap = GetOrCreateMetadataMap(O, P, true);
    metadataMap.set(MetadataKey, MetadataValue);
}
// https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinarymetadatakeys--o-p-
function OrdinaryMetadataKeys(O: Object, P: string | symbol): any[] {
    var ownKeys: any[] = OrdinaryOwnMetadataKeys(O, P);
    var parent = GetPrototypeOf(O);
    if (parent === null) {
        return ownKeys;
    }
    var parentKeys: any[] = OrdinaryMetadataKeys(parent, P);
    if (parentKeys.length <= 0) {
        return ownKeys;
    }
    if (ownKeys.length <= 0) {
        return parentKeys;
    }
    var set = new _Set<any>();
    var keys: any[] = [];
    for (var _i = 0; _i < ownKeys.length; _i++) {
        var key = ownKeys[_i];
        var hasKey = set.has(key);
        if (!hasKey) {
            set.add(key);
            keys.push(key);
        }
    }
    for (var _a = 0; _a < parentKeys.length; _a++) {
        var key = parentKeys[_a];
        var hasKey = set.has(key);
        if (!hasKey) {
            set.add(key);
            keys.push(key);
        }
    }
    return keys;
}
// https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#ordinaryownmetadatakeys--o-p-
function OrdinaryOwnMetadataKeys(target: Object, targetKey: string | symbol): any[] {
    var metadataMap: Map<any, any> = GetOrCreateMetadataMap(target, targetKey, false);
    var keys: any[] = [];
    if (metadataMap) {
        metadataMap.forEach(function (_, key) { return keys.push(key); });
    }
    return keys;
}
// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-language-types-undefined-type
function IsUndefined(x): boolean {
    return x === undefined;
}
// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
function IsArray(x): boolean {
    return Array.isArray(x);
}
// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object-type
function IsObject(x): boolean {
    return typeof x === "object" ? x !== null : typeof x === "function";
}
// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
function IsConstructor(x): boolean {
    return typeof x === "function";
}
// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ecmascript-language-types-symbol-type
function IsSymbol(x): boolean {
    return typeof x === "symbol";
}
// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
function ToPropertyKey(value): string | symbol {
    if (IsSymbol(value)) {
        return value;
    }
    return String(value);
}
function GetPrototypeOf(O) {
    var proto = Object.getPrototypeOf(O);
    if (typeof O !== "function" || O === functionPrototype) {
        return proto;
    }
    // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
    // Try to determine the superclass constructor. Compatible implementations
    // must either set __proto__ on a subclass constructor to the superclass constructor,
    // or ensure each class has a valid `constructor` property on its prototype that
    // points back to the constructor.
    // If this is not the same as Function.[[Prototype]], then this is definately inherited.
    // This is the case when in ES6 or when using __proto__ in a compatible browser.
    if (proto !== functionPrototype) {
        return proto;
    }
    // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
    var prototype = O.prototype;
    var prototypeProto = Object.getPrototypeOf(prototype);
    if (prototypeProto == null || prototypeProto === Object.prototype) {
        return proto;
    }
    // if the constructor was not a function, then we cannot determine the heritage.
    var constructor = prototypeProto.constructor;
    if (typeof constructor !== "function") {
        return proto;
    }
    // if we have some kind of self-reference, then we cannot determine the heritage.
    if (constructor === O) {
        return proto;
    }
    // we have a pretty good guess at the heritage.
    return constructor;
}
