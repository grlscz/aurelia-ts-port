import {Dictionary} from 'aurelia-tsutil';
import {IMessageType, ISimpleEventCallback, IComplexEventCallback, IUnsubscribe, IEventAggregator, IHandler} from './interfaces';
export {IMessageType, ISimpleEventCallback, IComplexEventCallback, IUnsubscribe, IEventAggregator, IHandler} from './interfaces';

class Handler implements IHandler<any> {
    public messageType: IMessageType<any>;
    public callback: IComplexEventCallback<any>;
    constructor(messageType: new (...args) => any, callback: (message: any) => void) {
        this.messageType = messageType;
        this.callback = callback;
    }

    handle(message: any): void {
        if (message instanceof this.messageType) {
            this.callback.call(null, message);
        }
    }
}

export class EventAggregator implements IEventAggregator {
    public eventLookup: Dictionary<ISimpleEventCallback<any>[]>;
    public messageHandlers: IHandler<any>[];

    constructor() {
        this.eventLookup = {};
        this.messageHandlers = [];
    }

    publish<T>(event: string | T, data?: T) {
        var subscribers: ISimpleEventCallback<any>[]| IHandler<any>[], i: number;

        if (typeof event === 'string') {
            subscribers = this.eventLookup[event];
            if (subscribers) {
                subscribers = subscribers.slice();
                i = subscribers.length;

                while (i--) {
                    (<ISimpleEventCallback<T>>subscribers[i])(data, event);
                }
            }
        } else {
            subscribers = this.messageHandlers.slice();
            i = subscribers.length;

            while (i--) {
                (<IHandler<any>>subscribers[i]).handle(event);
            }
        }
    }

    subscribe<T>(event: string | IMessageType<T>, callback: ISimpleEventCallback<T> | IComplexEventCallback<T>): IUnsubscribe {
        var subscribers: ISimpleEventCallback<any>[]| IHandler<any>[], handler: Handler;

        if (typeof event === 'string') {
            subscribers = this.eventLookup[event] || (this.eventLookup[event] = []);

            (<ISimpleEventCallback<any>[]>subscribers).push(<ISimpleEventCallback<T>>callback);

            return function () {
                var idx = (<ISimpleEventCallback<any>[]>subscribers).indexOf(callback);
                if (idx != -1) {
                    (<ISimpleEventCallback<any>[]>subscribers).splice(idx, 1);
                }
            };
        } else {
            handler = new Handler(event, <IComplexEventCallback<T>>callback);
            subscribers = this.messageHandlers;

            (<IHandler<any>[]>subscribers).push(handler);

            return function () {
                var idx = (<IHandler<any>[]>subscribers).indexOf(handler);
                if (idx != -1) {
                    (<IHandler<any>[]>subscribers).splice(idx, 1);
                }
            };
        }
    }

    subscribeOnce<T>(event: string | IMessageType<T>, callback: ISimpleEventCallback<T> | IComplexEventCallback<T>): IUnsubscribe {
        var sub = this.subscribe(<any>event, <any>function (data: T, event?: string) {
            sub();
            return callback(data, event);
        });
        return sub;
    }
}

export function includeEventsIn(obj: IEventAggregator): EventAggregator {
    var ea = new EventAggregator();

    obj.subscribeOnce = function (event, callback) {
        return ea.subscribeOnce(event, callback);
    };

    obj.subscribe = function (event, callback) {
        return ea.subscribe(event, callback);
    };

    obj.publish = function (event, data?) {
        ea.publish(event, data);
    };

    return ea;
}

export function configure(aurelia) {
    aurelia.withInstance(EventAggregator, includeEventsIn(aurelia));
}
