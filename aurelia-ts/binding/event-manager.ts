import {IUnsubscribe, I__HasDelegatedEvents, IElementHandler, IElementEventsConfig, IEventStrategy} from './interfaces';
import {Dictionary} from 'tsutil';

class DefaultEventStrategy implements IEventStrategy {
    public delegatedEvents: Dictionary<boolean>;
    constructor() {
        this.delegatedEvents = {};
    }

    ensureDelegatedEvent(eventName: string) {
        if (this.delegatedEvents[eventName]) {
            return;
        }

        this.delegatedEvents[eventName] = true;
        document.addEventListener(eventName, this.handleDelegatedEvent.bind(this), false);
    }

    handleCallbackResult(result: void): void {
        //todo: coroutine via result?
    }

    handleDelegatedEvent(event: Event): void {
        event = event || window.event;
        var target: Node = <Node>event.target || event.srcElement,
            callback: EventListener;

        while (target && !callback) {
            if ((<I__HasDelegatedEvents>target).delegatedEvents) {
                callback = (<I__HasDelegatedEvents>target).delegatedEvents[event.type];
            }

            if (!callback) {
                target = target.parentNode;
            }
        }

        if (callback) {
            this.handleCallbackResult(callback(event));
        }
    }

    createDirectEventCallback(callback: EventListener): EventListener {
        return event => {
            this.handleCallbackResult(callback(event));
        };
    }

    subscribeToDelegatedEvent(target: Node, targetEvent: string, callback: EventListener): IUnsubscribe {
        var lookup = (<I__HasDelegatedEvents>target).delegatedEvents || ((<I__HasDelegatedEvents>target).delegatedEvents = {});

        this.ensureDelegatedEvent(targetEvent);
        lookup[targetEvent] = callback;

        return function () {
            lookup[targetEvent] = null;
        };
    }

    subscribeToDirectEvent(target: Node, targetEvent: string, callback: EventListener): IUnsubscribe {
        var directEventCallback = this.createDirectEventCallback(callback);
        target.addEventListener(targetEvent, directEventCallback, false);

        return function () {
            target.removeEventListener(targetEvent, directEventCallback);
        };
    }

    subscribe(target: Node, targetEvent: string, callback: EventListener, delegate: boolean): IUnsubscribe {
        if (delegate) {
            return this.subscribeToDirectEvent(target, targetEvent, callback);
        } else {
            return this.subscribeToDelegatedEvent(target, targetEvent, callback);
        }
    }
}

export class EventManager {
    public elementHandlerLookup: Dictionary<Dictionary<IElementHandler>>;
    public eventStrategyLookup: Dictionary<IEventStrategy>;
    public defaultEventStrategy: IEventStrategy;
    constructor() {
        this.elementHandlerLookup = {};
        this.eventStrategyLookup = {};

        this.registerElementConfig({
            tagName: 'input',
            properties: {
                value: ['change', 'input'],
                checked: ['change', 'input']
            }
        });

        this.registerElementConfig({
            tagName: 'textarea',
            properties: {
                value: ['change', 'input']
            }
        });

        this.registerElementConfig({
            tagName: 'select',
            properties: {
                value: ['change']
            }
        });

        this.registerElementConfig({
            tagName: 'content editable',
            properties: {
                value: ['change', 'input', 'blur', 'keyup', 'paste'],
            }
        });

        this.defaultEventStrategy = new DefaultEventStrategy();
    }

    registerElementConfig(config: IElementEventsConfig): void {
        var tagName = config.tagName.toLowerCase(), properties = config.properties, propertyName;
        this.elementHandlerLookup[tagName] = {};
        for (propertyName in properties) {
            if (properties.hasOwnProperty(propertyName)) {
                this.registerElementPropertyConfig(tagName, propertyName, properties[propertyName]);
            }
        }
    }

    registerElementPropertyConfig(tagName: string, propertyName: string, events: string[]): void {
        this.elementHandlerLookup[tagName][propertyName] = {
            subscribe(target: Element, callback: EventListener) {
                events.forEach(changeEvent => {
                    target.addEventListener(changeEvent, callback, false);
                });

                return function () {
                    events.forEach(changeEvent => {
                        target.removeEventListener(changeEvent, callback);
                    });
                }
            }
        }
    }

    registerElementHandler(tagName: string, handler: Dictionary<IElementHandler>): void {
        this.elementHandlerLookup[tagName.toLowerCase()] = handler;
    }

    registerEventStrategy(eventName: string, strategy: IEventStrategy): void {
        this.eventStrategyLookup[eventName] = strategy;
    }

    getElementHandler(target: Element, propertyName: string): IElementHandler {
        var tagName: string, lookup = this.elementHandlerLookup;
        if (target.tagName) {
            tagName = target.tagName.toLowerCase();
            if (lookup[tagName] && lookup[tagName][propertyName]) {
                return lookup[tagName][propertyName];
            }
            if (propertyName === 'textContent' || propertyName === 'innerHTML') {
                return lookup['content editable']['value'];
            }
        }

        return null;
    }

    addEventListener(target: Element, targetEvent: string, callback: EventListener, delegate: boolean): IUnsubscribe {
        return (this.eventStrategyLookup[targetEvent] || this.defaultEventStrategy)
            .subscribe(target, targetEvent, callback, delegate);
    }
}
