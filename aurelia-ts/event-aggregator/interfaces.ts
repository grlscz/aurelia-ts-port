export interface IMessageType<T extends Object> {
    new (...args): T;
}

export interface ISimpleEventCallback<T> { (data: T, event: string): void }
export interface IComplexEventCallback<T extends Object> { (message: T): void }

export interface IUnsubscribe { (): void }

export interface IEventAggregator {
    publish<T>(event: string, data: T): void;
    publish<T extends Object>(event: T): void;
    subscribe<T>(event: string, callback: ISimpleEventCallback<T>): IUnsubscribe;
    subscribe<T extends Object>(event: IMessageType<T>, callback: IComplexEventCallback<T>): IUnsubscribe;
    subscribeOnce<T>(event: string, callback: ISimpleEventCallback<T>): IUnsubscribe;
    subscribeOnce<T extends Object>(event: IMessageType<T>, callback: IComplexEventCallback<T>): IUnsubscribe;
}

export interface IHandler<T extends Object> {
    messageType: IMessageType<T>;
    callback: IComplexEventCallback<T>;
    handle(message: T): void;
}