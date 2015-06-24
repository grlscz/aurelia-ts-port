import {IUnsubscribe, IValueObserver, IPropertyObserver} from './interfaces';

export class PathObserver implements IValueObserver {
    public leftObserver: IValueObserver;
    public disposeLeft: IUnsubscribe;
    public rightObserver: IPropertyObserver;
    public disposeRight: IUnsubscribe;
    public callback: (newValue: any) => void;
    constructor(leftObserver: IValueObserver, getRightObserver: (value: any) => IPropertyObserver, value: any) {
        this.leftObserver = leftObserver;

        this.disposeLeft = leftObserver.subscribe((newValue) => {
            var newRightValue = this.updateRight(getRightObserver(newValue));
            this.notify(newRightValue);
        });

        this.updateRight(getRightObserver(value));
    }

    updateRight(observer: IPropertyObserver): any {
        this.rightObserver = observer;

        if (this.disposeRight) {
            this.disposeRight();
        }

        if (!observer) {
            return null;
        }

        this.disposeRight = observer.subscribe(newValue => this.notify(newValue));
        return observer.getValue();
    }

    subscribe(callback: (newValue: any) => void): IUnsubscribe {
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
        if (this.disposeLeft) {
            this.disposeLeft();
        }

        if (this.disposeRight) {
            this.disposeRight();
        }
    }
}
