import {Dictionary} from 'tsutil';
import {OoObjectObserver} from './property-observation';
import {ObserverLocator} from './observer-locator';

export interface IValueObserver {
    subscribe(callback: (newValue: any) => void): IUnsubscribe;
}

// access-keyed-observer
export interface IValueInfo {
    observer?: IValueObserver | IPropertyObserver;
    value: any;
}

// array-change-records
export interface IArrayChangeRecord {
    index: number;
    removed: any[];
    addedCount: number;
}

// array-observation
export interface IArrayObserver {
    subscribe(callback: IArrayChangedCallback): IUnsubscribe;
    getLengthObserver(): IPropertyObserver;
}
export interface IArrayChangedCallback {
    (changes: IArrayChangeRecord[]): void;
}

// ast
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

// binding-expression
export interface IBindablePropertyObserver extends IPropertyObserver {
    bind?(): void;
    unbind?(): void;
}

// binding-modes
export const enum BindingMode {
    oneTime = 0,
    oneWay = 1,
    twoWay = 2
}

// collection-observation
export interface ICollectionChangedCallback<R extends IArrayChangeRecord | IMapChangeRecord> {
    (changes: R[]): void;
}

// enviroment
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
    deliverChangeRecords(callback: (changes: IObjectObserveChangeRecord[]| IArrayObserveChangeRecord[]) => void);
    unobserve(obj: Object, callback: (changes: IObjectObserveChangeRecord[]) => void);
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
    unobserve(obj: Object, callback: (changes: IArrayObserveChangeRecord[]) => void);
}

// event-manager
export interface IEventStrategy {
    subscribe(target: Element, targetEvent: string, callback: EventListener, delegate: boolean): IUnsubscribe;
}
export interface IElementEventsConfig {
    tagName: string;
    properties: Dictionary<string[]>
}
export interface IElementHandler {
    subscribe(element: Element, callback: EventListener): IUnsubscribe;
}

// map-change-records
export interface IMapChangeRecord {
    type: string,
    object: Map<any,any>,
    key: any,
    oldValue?: any
}

// map-observation
export interface IMapObserver {
    subscribe(callback: IMapChangedCallback): IUnsubscribe;
    getLengthObserver(): IPropertyObserver;
}
export interface IMapChangedCallback {
    (changes: IMapChangeRecord[]): void;
}

// property-observation
export interface IUnsubscribe {
    (): void;
}

export interface IValueChangedCallback {
    (newValue: any, oldValue: any): void
}

export interface IPropertyObserver extends IValueObserver {
    getValue(): any;
    setValue(newValue: any): void;
    subscribe(callback: IValueChangedCallback): IUnsubscribe;
}

// array-change-records internals
export const enum __EditKind {
    EDIT_LEAVE = 0,
    EDIT_UPDATE = 1,
    EDIT_ADD = 2,
    EDIT_DELETE = 3
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

// ast internals
import {Chain, ValueConverter, Assign, Conditional, AccessScope, AccessMember, AccessKeyed, CallScope, CallFunction, CallMember, PrefixNot, Binary, LiteralPrimitive, LiteralArray, LiteralObject, LiteralString} from './ast';

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

// element observation internals
export interface I__HTMLElementWithModel extends HTMLElement {
    model: string;
}

// event-manager internals
export interface I__HasDelegatedEvents extends Node {
    delegatedEvents: Dictionary<EventListener>
}

// computed-observation internals
export interface I__HasDeclaredDependencies extends PropertyDescriptor {
    get: {
        (): any;
        dependencies: string[];
    }
}

// listener-expression internals
export interface I__Has$Event {
    $event?: Event;
}

// name-expression internals
export interface I__HasExecutionContext {
    executionContext?: Object
}

// observer-locator internals
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

// property-observation internals
export interface I__OoPropertyObserver extends IPropertyObserver {
    callbacks: IValueChangedCallback[];
    trigger(newValue: any, oldValue: any): void;
}
