declare module 'aurelia-event-aggregator/interfaces' {
	export interface IMessageType<T extends Object> {
	    new (...args: any[]): T;
	}
	export interface ISimpleEventCallback<T> {
	    (data: T, event: string): void;
	}
	export interface IComplexEventCallback<T extends Object> {
	    (message: T): void;
	}
	export interface IUnsubscribe {
	    (): void;
	}
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

}
declare module 'aurelia-event-aggregator/index' {
	import { Dictionary } from 'aurelia-tsutil';
	import { IMessageType, ISimpleEventCallback, IComplexEventCallback, IUnsubscribe, IEventAggregator, IHandler } from 'aurelia-event-aggregator/interfaces';
	export { IMessageType, ISimpleEventCallback, IComplexEventCallback, IUnsubscribe, IEventAggregator, IHandler } from 'aurelia-event-aggregator/interfaces';
	export class EventAggregator implements IEventAggregator {
	    eventLookup: Dictionary<ISimpleEventCallback<any>[]>;
	    messageHandlers: IHandler<any>[];
	    constructor();
	    publish<T>(event: string | T, data?: T): void;
	    subscribe<T>(event: string | IMessageType<T>, callback: ISimpleEventCallback<T> | IComplexEventCallback<T>): IUnsubscribe;
	    subscribeOnce<T>(event: string | IMessageType<T>, callback: ISimpleEventCallback<T> | IComplexEventCallback<T>): IUnsubscribe;
	}
	export function includeEventsIn(obj: IEventAggregator): EventAggregator;
	export function configure(aurelia: any): void;

}
declare module 'aurelia-event-aggregator' {
	export * from 'aurelia-event-aggregator/index';
}
