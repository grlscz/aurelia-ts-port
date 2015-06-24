import {IUnsubscribe, IValueObserver} from './interfaces';

export class CompositeObserver implements IValueObserver {
    public subscriptions: IUnsubscribe[];
    public evaluate: () => any;
    public callback: (evaluated: any) => void;
    constructor(observers: IValueObserver[], evaluate: () => any) {
        this.subscriptions = new Array(observers.length);
        this.evaluate = evaluate;

        for (var i = 0, ii = observers.length; i < ii; i++) {
            this.subscriptions[i] = observers[i].subscribe((newValue) => {
                this.notify(this.evaluate());
            });
        }
    }

    subscribe(callback: (evaluated: any) => void): IUnsubscribe {
        var that = this;
        that.callback = callback;
        return function () {
            that.callback = null;
        };
    }

    notify(newValue: any): void {
        var callback = this.callback;

        if (callback) {
            callback(newValue);
        }
    }

    dispose(): void {
        var subscriptions = this.subscriptions;

        var i = subscriptions.length;
        while (i--) {
            subscriptions[i]();
        }
    }
}
