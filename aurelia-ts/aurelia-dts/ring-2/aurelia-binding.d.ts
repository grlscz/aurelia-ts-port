declare module 'aurelia-binding/environment' {
	export var hasObjectObserve: boolean;
	export var hasArrayObserve: boolean;

}
declare module 'aurelia-binding/array-change-records' {
	import { IArrayObserveChangeRecord, IArrayChangeRecord } from 'aurelia-binding/interfaces';
	export function calcSplices(current: ArrayLike<any>, currentStart: number, currentEnd: number, old: ArrayLike<any>, oldStart: number, oldEnd: number): IArrayChangeRecord[];
	export function projectArraySplices(array: ArrayLike<any>, changeRecords: IArrayObserveChangeRecord[]): IArrayChangeRecord[];

}
declare module 'aurelia-binding/map-change-records' {
	import { IMapChangeRecord } from 'aurelia-binding/interfaces';
	export function getChangeRecords<K, V>(map: Map<K, V>): IMapChangeRecord[];

}
declare module 'aurelia-binding/collection-observation' {
	import { IPropertyObserver, IValueChangedCallback, IUnsubscribe, IMapChangeRecord, IArrayChangeRecord, ICollectionChangedCallback, IArrayObserveChangeRecord } from 'aurelia-binding/interfaces';
	import { TaskQueue, ITask } from 'aurelia-task-queue';
	export class ModifyCollectionObserver<T extends Map<any, any> | ArrayLike<any>, R extends IArrayChangeRecord | IMapChangeRecord> implements ITask {
	    taskQueue: TaskQueue;
	    queued: boolean;
	    callbacks: ICollectionChangedCallback<R>[];
	    changeRecords: (IArrayObserveChangeRecord | IMapChangeRecord)[];
	    oldCollection: T;
	    collection: T;
	    lengthPropertyName: string;
	    lengthObserver: CollectionLengthObserver;
	    array: void;
	    constructor(taskQueue: TaskQueue, collection: T);
	    subscribe(callback: ICollectionChangedCallback<R>): IUnsubscribe;
	    addChangeRecord(changeRecord: (IArrayObserveChangeRecord | IMapChangeRecord)): void;
	    reset(oldCollection: T): void;
	    getLengthObserver(): CollectionLengthObserver;
	    call(): void;
	}
	export class CollectionLengthObserver implements IPropertyObserver {
	    collection: Map<any, any> | ArrayLike<any>;
	    callbacks: IValueChangedCallback[];
	    lengthPropertyName: string;
	    currentValue: number;
	    constructor(collection: Map<any, any> | ArrayLike<any>);
	    getValue(): number;
	    setValue(newValue: number): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	    call(newValue: number): void;
	}

}
declare module 'aurelia-binding/array-observation' {
	import { IArrayObserver } from 'aurelia-binding/interfaces';
	import { TaskQueue } from 'aurelia-task-queue';
	export function getArrayObserver(taskQueue: TaskQueue, array: any[]): IArrayObserver;

}
declare module 'aurelia-binding/map-observation' {
	import { IMapObserver } from 'aurelia-binding/interfaces';
	import { TaskQueue } from 'aurelia-task-queue';
	export function getMapObserver(taskQueue: TaskQueue, map: Map<any, any>): IMapObserver;

}
declare module 'aurelia-binding/event-manager' {
	import { IUnsubscribe, IElementHandler, IElementEventsConfig, IEventStrategy } from 'aurelia-binding/interfaces';
	import { Dictionary } from 'tsutil';
	export class EventManager {
	    elementHandlerLookup: Dictionary<Dictionary<IElementHandler>>;
	    eventStrategyLookup: Dictionary<IEventStrategy>;
	    defaultEventStrategy: IEventStrategy;
	    constructor();
	    registerElementConfig(config: IElementEventsConfig): void;
	    registerElementPropertyConfig(tagName: string, propertyName: string, events: string[]): void;
	    registerElementHandler(tagName: string, handler: Dictionary<IElementHandler>): void;
	    registerEventStrategy(eventName: string, strategy: IEventStrategy): void;
	    getElementHandler(target: Element, propertyName: string): IElementHandler;
	    addEventListener(target: Element, targetEvent: string, callback: EventListener, delegate: boolean): IUnsubscribe;
	}

}
declare module 'aurelia-binding/dirty-checking' {
	import { IValueChangedCallback, IPropertyObserver, IUnsubscribe } from 'aurelia-binding/interfaces';
	export class DirtyChecker {
	    tracked: DirtyCheckProperty[];
	    checkDelay: number;
	    constructor();
	    addProperty(property: DirtyCheckProperty): void;
	    removeProperty(property: DirtyCheckProperty): void;
	    scheduleDirtyCheck(): void;
	    check(): void;
	}
	export class DirtyCheckProperty implements IPropertyObserver {
	    dirtyChecker: DirtyChecker;
	    obj: Object;
	    propertyName: string;
	    callbacks: IValueChangedCallback[];
	    isSVG: boolean;
	    oldValue: any;
	    tracking: boolean;
	    newValue: any;
	    constructor(dirtyChecker: DirtyChecker, obj: Object, propertyName: string);
	    getValue(): any;
	    setValue(newValue: any): void;
	    call(): void;
	    isDirty(): boolean;
	    beginTracking(): void;
	    endTracking(): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	}

}
declare module 'aurelia-binding/element-observation' {
	import { IPropertyObserver, IValueChangedCallback, IUnsubscribe, IElementHandler, IBindablePropertyObserver } from 'aurelia-binding/interfaces';
	import { Dictionary } from 'tsutil';
	import { ObserverLocator } from 'aurelia-binding/observer-locator';
	export class XLinkAttributeObserver implements IPropertyObserver {
	    element: Element;
	    propertyName: string;
	    attributeName: string;
	    constructor(element: Element, propertyName: string, attributeName: string);
	    getValue(): string;
	    setValue(newValue: string): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	}
	export class DataAttributeObserver implements IPropertyObserver {
	    element: Element;
	    propertyName: string;
	    constructor(element: Element, propertyName: string);
	    getValue(): string;
	    setValue(newValue: string): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	}
	export class StyleObserver implements IPropertyObserver {
	    element: HTMLElement;
	    propertyName: string;
	    constructor(element: HTMLElement, propertyName: string);
	    getValue(): string;
	    setValue(newValue: any): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	    flattenCss(object: Dictionary<string>): string;
	}
	export class ValueAttributeObserver implements IPropertyObserver {
	    element: Element;
	    propertyName: string;
	    handler: IElementHandler;
	    callbacks: IValueChangedCallback[];
	    oldValue: any;
	    disposeHandler: IUnsubscribe;
	    constructor(element: Element, propertyName: string, handler: IElementHandler);
	    getValue(): any;
	    setValue(newValue: any): void;
	    call(): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	    unsubscribe(callback: IValueChangedCallback): void;
	}
	export class SelectValueObserver implements IPropertyObserver, IBindablePropertyObserver {
	    element: HTMLSelectElement;
	    handler: IElementHandler;
	    observerLocator: ObserverLocator;
	    value: string | string[];
	    arraySubscription: IUnsubscribe;
	    initialSync: boolean;
	    oldValue: string | string[];
	    callbacks: IValueChangedCallback[];
	    disposeHandler: IUnsubscribe;
	    domObserver: MutationObserver;
	    constructor(element: HTMLSelectElement, handler: IElementHandler, observerLocator: ObserverLocator);
	    getValue(): string | string[];
	    setValue(newValue: string | string[]): void;
	    synchronizeOptions(): void;
	    synchronizeValue(): void;
	    call(): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	    unsubscribe(callback: IValueChangedCallback): void;
	    bind(): void;
	    unbind(): void;
	}
	export class CheckedObserver implements IPropertyObserver, IBindablePropertyObserver {
	    element: HTMLInputElement;
	    handler: IElementHandler;
	    observerLocator: ObserverLocator;
	    value: boolean | string | string[];
	    arraySubscription: IUnsubscribe;
	    initialSync: boolean;
	    oldValue: boolean | string | string[];
	    callbacks: IValueChangedCallback[];
	    disposeHandler: IUnsubscribe;
	    constructor(element: HTMLInputElement, handler: IElementHandler, observerLocator: ObserverLocator);
	    getValue(): boolean | string | string[];
	    setValue(newValue: boolean | string | string[]): void;
	    synchronizeElement(): void;
	    synchronizeValue(): void;
	    call(): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	    unsubscribe(callback: IValueChangedCallback): void;
	    unbind(): void;
	}

}
declare module 'aurelia-binding/computed-observation' {
	import { IValueChangedCallback, IPropertyObserver, IUnsubscribe } from 'aurelia-binding/interfaces';
	import { ObserverLocator } from 'aurelia-binding/observer-locator';
	export class ComputedPropertyObserver implements IPropertyObserver {
	    obj: Object;
	    propertyName: string;
	    descriptor: PropertyDescriptor;
	    observerLocator: ObserverLocator;
	    callbacks: IValueChangedCallback[];
	    oldValue: any;
	    subscriptions: IUnsubscribe[];
	    constructor(obj: Object, propertyName: string, descriptor: PropertyDescriptor, observerLocator: ObserverLocator);
	    getValue(): any;
	    setValue(newValue: any): void;
	    trigger(newValue: any, oldValue: any): void;
	    evaluate(): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	}
	export function hasDeclaredDependencies(descriptor: PropertyDescriptor): boolean;
	export function declarePropertyDependencies(ctor: Function, propertyName: string, dependencies: string[]): void;

}
declare module 'aurelia-binding/observer-locator' {
	import { IPropertyObserver, IArrayObserver, IMapObserver } from 'aurelia-binding/interfaces';
	import { Dictionary } from 'tsutil';
	import { TaskQueue } from 'aurelia-task-queue';
	import { EventManager } from 'aurelia-binding/event-manager';
	import { DirtyChecker } from 'aurelia-binding/dirty-checking';
	export class ObserverLocator {
	    taskQueue: TaskQueue;
	    eventManager: EventManager;
	    dirtyChecker: DirtyChecker;
	    observationAdapters: ObjectObservationAdapter[];
	    static inject(): any[];
	    constructor(taskQueue: TaskQueue, eventManager: EventManager, dirtyChecker: DirtyChecker, observationAdapters: ObjectObservationAdapter[]);
	    getObserversLookup(obj: Object): Dictionary<IPropertyObserver>;
	    getObserver(obj: Object, propertyName: string): IPropertyObserver;
	    getObservationAdapter(obj: Object, propertyName: string, descriptor: PropertyDescriptor): ObjectObservationAdapter;
	    createPropertyObserver(obj: Object, propertyName: string): IPropertyObserver;
	    getArrayObserver(array: any[]): IArrayObserver;
	    getMapObserver(map: Map<any, any>): IMapObserver;
	}
	export class ObjectObservationAdapter {
	    handlesProperty(object: Object, propertyName: string, descriptor: PropertyDescriptor): boolean;
	    getObserver(object: Object, propertyName: string, descriptor: PropertyDescriptor): IPropertyObserver;
	}

}
declare module 'aurelia-binding/property-observation' {
	import { IUnsubscribe, IPropertyObserver, IValueChangedCallback, IObjectObserveChangeRecord, I__OoPropertyObserver } from 'aurelia-binding/interfaces';
	import { ITask, TaskQueue } from 'aurelia-task-queue';
	import { ObserverLocator } from 'aurelia-binding/observer-locator';
	import { Dictionary } from 'tsutil';
	export class SetterObserver implements IPropertyObserver, ITask {
	    taskQueue: TaskQueue;
	    obj: Object;
	    propertyName: string;
	    callbacks: IValueChangedCallback[];
	    queued: boolean;
	    observing: boolean;
	    currentValue: any;
	    oldValue: any;
	    constructor(taskQueue: TaskQueue, obj: Object, propertyName: string);
	    getValue(): any;
	    setValue(newValue: any): void;
	    getterValue(): any;
	    setterValue(newValue: any): void;
	    call(): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	    convertProperty(): void;
	}
	export class OoObjectObserver {
	    obj: Object;
	    observers: Dictionary<I__OoPropertyObserver>;
	    observerLocator: ObserverLocator;
	    observing: boolean;
	    constructor(obj: Object, observerLocator: ObserverLocator);
	    subscribe(propertyObserver: I__OoPropertyObserver, callback?: IValueChangedCallback): IUnsubscribe;
	    getObserver(propertyName: string, descriptor?: PropertyDescriptor): I__OoPropertyObserver;
	    handleChanges(changeRecords: IObjectObserveChangeRecord[]): void;
	}
	export class OoPropertyObserver implements I__OoPropertyObserver {
	    owner: OoObjectObserver;
	    obj: Object;
	    propertyName: string;
	    callbacks: IValueChangedCallback[];
	    constructor(owner: OoObjectObserver, obj: Object, propertyName: string);
	    getValue(): any;
	    setValue(newValue: any): void;
	    trigger(newValue: any, oldValue: any): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	}
	export class UndefinedPropertyObserver implements I__OoPropertyObserver {
	    owner: OoObjectObserver;
	    obj: Object;
	    propertyName: string;
	    callbackMap: Map<IValueChangedCallback, IUnsubscribe>;
	    callbacks: IValueChangedCallback[];
	    actual: IPropertyObserver;
	    subscription: IUnsubscribe;
	    constructor(owner: OoObjectObserver, obj: Object, propertyName: string);
	    getValue(): any;
	    setValue(newValue: any): void;
	    trigger(newValue: any, oldValue: any): void;
	    getObserver(): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	}

}
declare module 'aurelia-binding/path-observer' {
	import { IUnsubscribe, IValueObserver, IPropertyObserver } from 'aurelia-binding/interfaces';
	export class PathObserver implements IValueObserver {
	    leftObserver: IValueObserver;
	    disposeLeft: IUnsubscribe;
	    rightObserver: IPropertyObserver;
	    disposeRight: IUnsubscribe;
	    callback: (newValue: any) => void;
	    constructor(leftObserver: IValueObserver, getRightObserver: (value: any) => IPropertyObserver, value: any);
	    updateRight(observer: IPropertyObserver): any;
	    subscribe(callback: (newValue: any) => void): IUnsubscribe;
	    notify(newValue: any): void;
	    dispose(): void;
	}

}
declare module 'aurelia-binding/composite-observer' {
	import { IUnsubscribe, IValueObserver } from 'aurelia-binding/interfaces';
	export class CompositeObserver implements IValueObserver {
	    subscriptions: IUnsubscribe[];
	    evaluate: () => any;
	    callback: (evaluated: any) => void;
	    constructor(observers: IValueObserver[], evaluate: () => any);
	    subscribe(callback: (evaluated: any) => void): IUnsubscribe;
	    notify(newValue: any): void;
	    dispose(): void;
	}

}
declare module 'aurelia-binding/ast' {
	import { IValueInfo, IValueConvertersLookup, IExpression, IBinding, IBindableExpression, IAssignableExpression, I__ExpressionTraversal, I__ExpressionVisitor } from 'aurelia-binding/interfaces';
	export class Expression {
	    isChain: boolean;
	    isAssignable: boolean;
	    constructor();
	    evaluate(scope: Object, valueConverters: IValueConvertersLookup): any;
	    assign(scope: Object, value: any, valueConverters: IValueConvertersLookup): any;
	    toString(): string;
	}
	export class Chain extends Expression implements IExpression, I__ExpressionTraversal {
	    expressions: IExpression[];
	    constructor(expressions: IExpression[]);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	}
	export class ValueConverter extends Expression implements IAssignableExpression, I__ExpressionTraversal {
	    expression: IExpression;
	    name: string;
	    args: IBindableExpression[];
	    allArgs: IBindableExpression[];
	    constructor(expression: IExpression, name: string, args: IBindableExpression[], allArgs: IBindableExpression[]);
	    evaluate(scope: Object, valueConverters: IValueConvertersLookup): any;
	    assign(scope: Object, value: any, valueConverters: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class Assign extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    target: IAssignableExpression;
	    value: any;
	    constructor(target: IAssignableExpression, value: any);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(vistor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class Conditional extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    condition: IBindableExpression;
	    yes: IBindableExpression;
	    no: IBindableExpression;
	    constructor(condition: IBindableExpression, yes: IBindableExpression, no: IBindableExpression);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class AccessScope extends Expression implements IAssignableExpression, I__ExpressionTraversal {
	    name: string;
	    isAssignable: boolean;
	    constructor(name: string);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    assign(scope: Object, value: any, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class AccessMember extends Expression implements IAssignableExpression, I__ExpressionTraversal {
	    object: IAssignableExpression;
	    name: string;
	    isAssignable: boolean;
	    constructor(object: IAssignableExpression, name: string);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    assign(scope: Object, value: any, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class AccessKeyed extends Expression implements IAssignableExpression, I__ExpressionTraversal {
	    object: IBindableExpression;
	    key: IBindableExpression;
	    isAssignable: boolean;
	    constructor(object: IBindableExpression, key: IBindableExpression);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    assign(scope: Object, value: any, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class CallScope extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    name: string;
	    args: IBindableExpression[];
	    constructor(name: string, args: IBindableExpression[]);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup, args?: any[]): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class CallMember extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    object: IBindableExpression;
	    name: string;
	    args: IBindableExpression[];
	    constructor(object: IBindableExpression, name: string, args: IBindableExpression[]);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup, args?: any[]): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class CallFunction extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    func: IBindableExpression;
	    args: IBindableExpression[];
	    constructor(func: IBindableExpression, args: IBindableExpression[]);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup, args?: any[]): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class Binary extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    operation: string;
	    left: IBindableExpression;
	    right: IBindableExpression;
	    constructor(operation: string, left: IBindableExpression, right: IBindableExpression);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class PrefixNot extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    operation: string;
	    expression: IBindableExpression;
	    constructor(operation: string, expression: IBindableExpression);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class LiteralPrimitive extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    value: any;
	    constructor(value: any);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class LiteralString extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    value: string;
	    constructor(value: string);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class LiteralArray extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    elements: IBindableExpression[];
	    constructor(elements: IBindableExpression[]);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class LiteralObject extends Expression implements IBindableExpression, I__ExpressionTraversal {
	    keys: any[];
	    values: IBindableExpression[];
	    constructor(keys: any[], values: IBindableExpression[]);
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup): any;
	    accept(visitor: I__ExpressionVisitor): void;
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export class Unparser implements I__ExpressionVisitor {
	    buffer: string[];
	    constructor(buffer: string[]);
	    static unparse(expression: I__ExpressionTraversal): string;
	    write(text: string): void;
	    writeArgs(args: I__ExpressionTraversal[]): void;
	    visitChain(chain: Chain): void;
	    visitValueConverter(converter: ValueConverter): void;
	    visitAssign(assign: Assign): void;
	    visitConditional(conditional: Conditional): void;
	    visitAccessScope(access: AccessScope): void;
	    visitAccessMember(access: AccessMember): void;
	    visitAccessKeyed(access: AccessKeyed): void;
	    visitCallScope(call: CallScope): void;
	    visitCallFunction(call: CallFunction): void;
	    visitCallMember(call: CallMember): void;
	    visitPrefix(prefix: PrefixNot): void;
	    visitBinary(binary: Binary): void;
	    visitLiteralPrimitive(literal: LiteralPrimitive): void;
	    visitLiteralArray(literal: LiteralArray): void;
	    visitLiteralObject(literal: LiteralObject): void;
	    visitLiteralString(literal: LiteralString): void;
	}

}
declare module 'aurelia-binding/interfaces' {
	import { Dictionary } from 'tsutil';
	import { OoObjectObserver } from 'aurelia-binding/property-observation';
	import { ObserverLocator } from 'aurelia-binding/observer-locator';
	export interface IValueObserver {
	    subscribe(callback: (newValue: any) => void): IUnsubscribe;
	}
	export interface IValueInfo {
	    observer?: IValueObserver | IPropertyObserver;
	    value: any;
	}
	export interface IArrayChangeRecord {
	    index: number;
	    removed: any[];
	    addedCount: number;
	}
	export interface IArrayObserver {
	    subscribe(callback: IArrayChangedCallback): IUnsubscribe;
	    getLengthObserver(): IPropertyObserver;
	}
	export interface IArrayChangedCallback {
	    (changes: IArrayChangeRecord[]): void;
	}
	export interface IValueConverter {
	    toView?(...args: any[]): any;
	    fromView?(value: any, ...args: any[]): any;
	}
	export interface IValueConvertersLookup {
	    (name: string): IValueConverter;
	}
	export interface IExpression {
	    evaluate(scope: Object, valueConverters?: IValueConvertersLookup, args?: any[]): any;
	    isAssignable: boolean;
	}
	export interface IBinding {
	    valueConverterLookupFunction: IValueConvertersLookup;
	    observerLocator: ObserverLocator;
	    getObserver(scope: Object, name: string): IPropertyObserver;
	}
	export interface IBindableExpression extends IExpression {
	    connect(binding: IBinding, scope: Object): IValueInfo;
	}
	export interface IAssignableExpression extends IBindableExpression {
	    assign(scope: Object, value: any, valueConverters?: IValueConvertersLookup): any;
	}
	export interface IBindablePropertyObserver extends IPropertyObserver {
	    bind?(): void;
	    unbind?(): void;
	}
	export const enum BindingMode {
	    oneTime = 0,
	    oneWay = 1,
	    twoWay = 2,
	}
	export interface ICollectionChangedCallback<R extends IArrayChangeRecord | IMapChangeRecord> {
	    (changes: R[]): void;
	}
	export interface IObjectObserveChangeRecord {
	    /** The name of the property which was changed. */
	    name: string | number;
	    /** The changed object after the change was made. */
	    object: Object;
	    /** A string indicating the type of change taking place. One of "add", "update", or "delete". */
	    type: string;
	    /** Only for "update" and "delete" types. The value before the change. */
	    oldValue?: any;
	}
	export interface IObjectObserve extends ObjectConstructor {
	    observe(obj: Object, callback: (changes: IObjectObserveChangeRecord[]) => void, acceptList?: string[]): void;
	    deliverChangeRecords(callback: (changes: IObjectObserveChangeRecord[] | IArrayObserveChangeRecord[]) => void): any;
	    unobserve(obj: Object, callback: (changes: IObjectObserveChangeRecord[]) => void): any;
	}
	export interface IArrayObserveChangeRecord {
	    /** The name of the property which was changed. */
	    name?: string | number;
	    /** The changed array after the change was made. */
	    object: Object;
	    /** A string indicating the type of change taking place. One of "add", "update", "delete", or "splice". */
	    type: string;
	    /** Only for "update" and "delete" types. The value before the change. */
	    oldValue?: any;
	    /** Only for the "splice" type. The index at which the change occurred. */
	    index?: number;
	    /** Only for the "splice" type. An array of the removed elements. */
	    removed?: any[];
	    /** Only for the "splice" type. The number of elements added. */
	    addedCount?: number;
	}
	export interface IArrayObserve extends ArrayConstructor {
	    observe(obj: Object, callback: (changes: IArrayObserveChangeRecord[]) => void, acceptList?: string[]): void;
	    unobserve(obj: Object, callback: (changes: IArrayObserveChangeRecord[]) => void): any;
	}
	export interface IEventStrategy {
	    subscribe(target: Element, targetEvent: string, callback: EventListener, delegate: boolean): IUnsubscribe;
	}
	export interface IElementEventsConfig {
	    tagName: string;
	    properties: Dictionary<string[]>;
	}
	export interface IElementHandler {
	    subscribe(element: Element, callback: EventListener): IUnsubscribe;
	}
	export interface IMapChangeRecord {
	    type: string;
	    object: Map<any, any>;
	    key: any;
	    oldValue?: any;
	}
	export interface IMapObserver {
	    subscribe(callback: IMapChangedCallback): IUnsubscribe;
	    getLengthObserver(): IPropertyObserver;
	}
	export interface IMapChangedCallback {
	    (changes: IMapChangeRecord[]): void;
	}
	export interface IUnsubscribe {
	    (): void;
	}
	export interface IValueChangedCallback {
	    (newValue: any, oldValue: any): void;
	}
	export interface IPropertyObserver extends IValueObserver {
	    getValue(): any;
	    setValue(newValue: any): void;
	    subscribe(callback: IValueChangedCallback): IUnsubscribe;
	}
	export const enum __EditKind {
	    EDIT_LEAVE = 0,
	    EDIT_UPDATE = 1,
	    EDIT_ADD = 2,
	    EDIT_DELETE = 3,
	}
	export interface I__ArraySplice {
	    calcEditDistances(current: ArrayLike<any>, currentStart: number, currentEnd: number, old: ArrayLike<any>, oldStart: number, oldEnd: number): number[][];
	    spliceOperationsFromEditDistances(distances: number[][]): __EditKind[];
	    calcSplices(current: ArrayLike<any>, currentStart: number, currentEnd: number, old: ArrayLike<any>, oldStart: number, oldEnd: number): IArrayChangeRecord[];
	    sharedPrefix(current: ArrayLike<any>, old: ArrayLike<any>, searchLength: number): number;
	    sharedSuffix(current: ArrayLike<any>, old: ArrayLike<any>, searchLength: number): number;
	    calculateSplices(current: any, previous: any): IArrayChangeRecord[];
	    equals(currentValue: any, previousValue: any): boolean;
	}
	import { Chain, ValueConverter, Assign, Conditional, AccessScope, AccessMember, AccessKeyed, CallScope, CallFunction, CallMember, PrefixNot, Binary, LiteralPrimitive, LiteralArray, LiteralObject, LiteralString } from 'aurelia-binding/ast';
	export interface I__ExpressionTraversal extends IExpression {
	    accept(visitor: I__ExpressionVisitor): void;
	}
	export interface I__ExpressionVisitor {
	    visitChain(expression: Chain): void;
	    visitValueConverter(expression: ValueConverter): void;
	    visitAssign(expression: Assign): void;
	    visitConditional(expression: Conditional): void;
	    visitAccessScope(expression: AccessScope): void;
	    visitAccessMember(expression: AccessMember): void;
	    visitAccessKeyed(expression: AccessKeyed): void;
	    visitCallScope(expression: CallScope): void;
	    visitCallFunction(expression: CallFunction): void;
	    visitCallMember(expression: CallMember): void;
	    visitPrefix(expression: PrefixNot): void;
	    visitBinary(expression: Binary): void;
	    visitLiteralPrimitive(expression: LiteralPrimitive): void;
	    visitLiteralArray(expression: LiteralArray): void;
	    visitLiteralObject(expression: LiteralObject): void;
	    visitLiteralString(expression: LiteralString): void;
	}
	export interface I__HTMLElementWithModel extends HTMLElement {
	    model: string;
	}
	export interface I__HasDelegatedEvents extends Node {
	    delegatedEvents: Dictionary<EventListener>;
	}
	export interface I__HasDeclaredDependencies extends PropertyDescriptor {
	    get: {
	        (): any;
	        dependencies: string[];
	    };
	}
	export interface I__Has$Event {
	    $event?: Event;
	}
	export interface I__HasExecutionContext {
	    executionContext?: Object;
	}
	export interface I__HasObserversLookup {
	    __observers__: Dictionary<IPropertyObserver>;
	}
	export interface I__HasOoObserver {
	    __observer__: OoObjectObserver;
	}
	export interface I__HasArrayObserver extends Array<any> {
	    __array_observer__: IArrayObserver;
	}
	export interface I__HasMapObserver extends Map<any, any> {
	    __map_observer__: IMapObserver;
	}
	export interface I__ObjectGetPropertyDescriptor extends ObjectConstructor {
	    getPropertyDescriptor: typeof Object.getOwnPropertyDescriptor;
	}
	export interface I__OoPropertyObserver extends IPropertyObserver {
	    callbacks: IValueChangedCallback[];
	    trigger(newValue: any, oldValue: any): void;
	}

}
declare module 'aurelia-binding/access-keyed-observer' {
	import { IValueObserver, IUnsubscribe, IValueInfo } from 'aurelia-binding/interfaces';
	import { ObserverLocator } from 'aurelia-binding/observer-locator';
	export class AccessKeyedObserver implements IValueObserver {
	    objectInfo: IValueInfo;
	    keyInfo: IValueInfo;
	    evaluate: () => any;
	    observerLocator: ObserverLocator;
	    disposeKey: IUnsubscribe;
	    disposeObject: IUnsubscribe;
	    disposeProperty: IUnsubscribe;
	    callback: (evaluated: any) => void;
	    constructor(objectInfo: IValueInfo, keyInfo: IValueInfo, observerLocator: ObserverLocator, evaluate: () => any);
	    updatePropertySubscription(object: any, key: any): void;
	    objectOrKeyChanged(object: Object, key?: any): void;
	    subscribe(callback: (evaluated: any) => void): IUnsubscribe;
	    notify(): void;
	    dispose(): void;
	}

}
declare module 'aurelia-binding/binding-modes' {
	import { BindingMode } from 'aurelia-binding/interfaces';
	export const bindingMode: {
	    oneTime: BindingMode;
	    oneWay: BindingMode;
	    twoWay: BindingMode;
	};

}
declare module 'aurelia-binding/binding-expression' {
	import { IAssignableExpression, IValueConvertersLookup, BindingMode } from 'aurelia-binding/interfaces';
	import { ObserverLocator } from 'aurelia-binding/observer-locator';
	export class BindingExpression {
	    observerLocator: ObserverLocator;
	    targetProperty: string;
	    sourceExpression: IAssignableExpression;
	    mode: BindingMode;
	    valueConverterLookupFunction: IValueConvertersLookup;
	    attribute: string;
	    discrete: boolean;
	    constructor(observerLocator: ObserverLocator, targetProperty: string, sourceExpression: IAssignableExpression, mode: BindingMode, valueConverterLookupFunction: IValueConvertersLookup, attribute?: string);
	    createBinding(target: Object): any;
	}

}
declare module 'aurelia-binding/call-expression' {
	import { IExpression, IValueConvertersLookup } from 'aurelia-binding/interfaces';
	import { ObserverLocator } from 'aurelia-binding/observer-locator';
	export class CallExpression {
	    observerLocator: ObserverLocator;
	    targetProperty: string;
	    sourceExpression: IExpression;
	    valueConverterLookupFunction: IValueConvertersLookup;
	    constructor(observerLocator: ObserverLocator, targetProperty: string, sourceExpression: IExpression, valueConverterLookupFunction: IValueConvertersLookup);
	    createBinding(target: Object): any;
	}

}
declare module 'aurelia-binding/value-converter' {
	export interface _IValueConverter {
	    _IValueConverter: any;
	}
	export interface _IContainer {
	    get(target: _ITarget): _IValueConverter;
	    _IContainer987654567: any;
	}
	export interface _ITarget {
	    _ITarget4562y3864257348: any;
	}
	export interface _IRegistry {
	    registerValueConverter(name: string, valueConverter: _IValueConverter): void;
	    _IRegistry9276457263794: any;
	}
	export class ValueConverterResource {
	    name: string;
	    instance: _IValueConverter;
	    constructor(name?: string);
	    static convention(name: string): ValueConverterResource;
	    analyze(container: _IContainer, target: _ITarget): void;
	    register(registry: _IRegistry, name: string): void;
	    load(container: _IContainer, target: _ITarget): Promise<ValueConverterResource>;
	}

}
declare module 'aurelia-binding/lexer' {
	export class Token {
	    index: number;
	    text: string;
	    opKey: string;
	    key: string;
	    value: any;
	    constructor(index: number, text: string);
	    withOp(op: string): Token;
	    withGetterSetter(key: string): Token;
	    withValue(value: any): Token;
	    toString(): string;
	}
	export class Lexer {
	    lex(text: string): Token[];
	}
	export class Scanner {
	    input: string;
	    length: number;
	    peek: number;
	    index: number;
	    constructor(input: string);
	    scanToken(): Token;
	    scanCharacter(start: number, text: string): Token;
	    scanOperator(start: number, text: string): Token;
	    scanComplexOperator(start: number, code: number, one: string, two: string): Token;
	    scanIdentifier(): Token;
	    scanNumber(start: number): Token;
	    scanString(): Token;
	    advance(): void;
	    error(message: string, offset?: number): void;
	}

}
declare module 'aurelia-binding/parser' {
	import { IExpression, IBindableExpression } from 'aurelia-binding/interfaces';
	import { Dictionary } from 'tsutil';
	import { Lexer, Token } from 'aurelia-binding/lexer';
	export class Parser {
	    cache: Dictionary<IExpression>;
	    lexer: Lexer;
	    constructor();
	    parse(input: string): IExpression;
	}
	export class ParserImplementation {
	    index: number;
	    input: string;
	    tokens: Token[];
	    constructor(lexer: Lexer, input: string);
	    peek: Token;
	    parseChain(): IExpression;
	    parseValueConverter(): IBindableExpression;
	    parseExpression(): IBindableExpression;
	    parseConditional(): IBindableExpression;
	    parseLogicalOr(): IBindableExpression;
	    parseLogicalAnd(): IBindableExpression;
	    parseEquality(): IBindableExpression;
	    parseRelational(): IBindableExpression;
	    parseAdditive(): IBindableExpression;
	    parseMultiplicative(): IBindableExpression;
	    parsePrefix(): IBindableExpression;
	    parseAccessOrCallMember(): IBindableExpression;
	    parsePrimary(): IBindableExpression;
	    parseAccessOrCallScope(): IBindableExpression;
	    parseObject(): IBindableExpression;
	    parseExpressionList(terminator: any): IBindableExpression[];
	    optional(text: string): boolean;
	    expect(text: string): void;
	    advance(): void;
	    error(message: string): void;
	}

}
declare module 'aurelia-binding/listener-expression' {
	import { IExpression } from 'aurelia-binding/interfaces';
	import { EventManager } from 'aurelia-binding/event-manager';
	export class ListenerExpression {
	    eventManager: EventManager;
	    targetEvent: string;
	    sourceExpression: IExpression;
	    delegate: boolean;
	    discrete: boolean;
	    preventDefault: boolean;
	    constructor(eventManager: EventManager, targetEvent: string, sourceExpression: IExpression, delegate: boolean, preventDefault: boolean);
	    createBinding(target: Element): any;
	}

}
declare module 'aurelia-binding/name-expression' {
	export class NameExpression {
	    property: string;
	    discrete: boolean;
	    mode: string;
	    constructor(name: string, mode: string);
	    createBinding(target: Object): any;
	}

}
declare module 'aurelia-binding/index' {
	export { EventManager } from 'aurelia-binding/event-manager';
	export { ObserverLocator, ObjectObservationAdapter } from 'aurelia-binding/observer-locator';
	export { ValueConverterResource } from 'aurelia-binding/value-converter';
	export { calcSplices } from 'aurelia-binding/array-change-records';
	export * from 'aurelia-binding/binding-modes';
	export { Parser } from 'aurelia-binding/parser';
	export { BindingExpression } from 'aurelia-binding/binding-expression';
	export { ListenerExpression } from 'aurelia-binding/listener-expression';
	export { NameExpression } from 'aurelia-binding/name-expression';
	export { CallExpression } from 'aurelia-binding/call-expression';
	export { DirtyChecker } from 'aurelia-binding/dirty-checking';
	export { getChangeRecords } from 'aurelia-binding/map-change-records';
	export { ComputedPropertyObserver, declarePropertyDependencies } from 'aurelia-binding/computed-observation';
	export function valueConverter(): ClassDecorator;
	export function valueConverter(name: string): ClassDecorator;
	export function valueConverter(target: Function): void;
	export function computedFrom(...rest: string[]): MethodDecorator;

}
declare module 'aurelia-binding' {
	export * from 'aurelia-binding/index';
}
