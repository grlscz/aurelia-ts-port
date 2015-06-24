import {IUnsubscribe, IExpression, I__Has$Event} from './interfaces';
import {EventManager} from './event-manager';

export class ListenerExpression {
    public eventManager: EventManager;
    public targetEvent: string;
    public sourceExpression: IExpression;
    public delegate: boolean;
    public discrete: boolean;
    public preventDefault: boolean;
    constructor(eventManager: EventManager, targetEvent: string, sourceExpression: IExpression, delegate: boolean, preventDefault: boolean) {
        this.eventManager = eventManager;
        this.targetEvent = targetEvent;
        this.sourceExpression = sourceExpression;
        this.delegate = delegate;
        this.discrete = true;
        this.preventDefault = preventDefault;
    }

    createBinding(target: Element): any {
        return new Listener(
            this.eventManager,
            this.targetEvent,
            this.delegate,
            this.sourceExpression,
            target,
            this.preventDefault
            );
    }
}

class Listener {
    public eventManager: EventManager;
    public targetEvent: string;
    public sourceExpression: IExpression;
    public delegate: boolean;
    public target: Element;
    public preventDefault: boolean;
    public source: Object;
    private _disposeListener: IUnsubscribe;
    constructor(eventManager: EventManager, targetEvent: string, delegate: boolean, sourceExpression: IExpression, target: Element, preventDefault: boolean) {
        this.eventManager = eventManager;
        this.targetEvent = targetEvent;
        this.delegate = delegate;
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.preventDefault = preventDefault;
    }

    bind(source: Object): void {
        if (this._disposeListener) {
            if (this.source === source) {
                return;
            }

            this.unbind();
        }

        this.source = source;
        this._disposeListener = this.eventManager.addEventListener(this.target, this.targetEvent, event => {
            var prevEvent = (<I__Has$Event>source).$event;
            (<I__Has$Event>source).$event = event;
            var result = this.sourceExpression.evaluate(source);
            (<I__Has$Event>source).$event = prevEvent;
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            return result;
        }, this.delegate);
    }

    unbind(): void {
        if (this._disposeListener) {
            this._disposeListener();
            this._disposeListener = null;
        }
    }
}
