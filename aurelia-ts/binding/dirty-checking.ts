import {IValueChangedCallback, IPropertyObserver, IUnsubscribe} from './interfaces';

export class DirtyChecker {
    public tracked: DirtyCheckProperty[];
    public checkDelay: number;
    constructor() {
        this.tracked = [];
        this.checkDelay = 120;
    }

    addProperty(property: DirtyCheckProperty): void {
        var tracked = this.tracked;

        tracked.push(property);

        if (tracked.length === 1) {
            this.scheduleDirtyCheck();
        }
    }

    removeProperty(property: DirtyCheckProperty): void {
        var tracked = this.tracked;
        tracked.splice(tracked.indexOf(property), 1);
    }

    scheduleDirtyCheck(): void {
        setTimeout(() => this.check(), this.checkDelay);
    }

    check(): void {
        var tracked = this.tracked,
            i = tracked.length;

        while (i--) {
            var current = tracked[i];

            if (current.isDirty()) {
                current.call();
            }
        }

        if (tracked.length) {
            this.scheduleDirtyCheck();
        }
    }
}

export class DirtyCheckProperty implements IPropertyObserver {
    public dirtyChecker: DirtyChecker;
    public obj: Object;
    public propertyName: string;
    public callbacks: IValueChangedCallback[];
    public isSVG: boolean;
    public oldValue: any;
    public tracking: boolean;
    public newValue: any;
    constructor(dirtyChecker: DirtyChecker, obj: Object, propertyName: string) {
        this.dirtyChecker = dirtyChecker;
        this.obj = obj;
        this.propertyName = propertyName;
        this.callbacks = [];
        this.isSVG = obj instanceof SVGElement;
    }

    getValue(): any {
        return this.obj[this.propertyName];
    }

    setValue(newValue: any): void {
        if (this.isSVG) {
            (<SVGElement>this.obj).setAttributeNS(null, this.propertyName, newValue);
        } else {
            this.obj[this.propertyName] = newValue;
        }
    }

    call(): void {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.getValue();

        while (i--) {
            callbacks[i](newValue, oldValue);
        }

        this.oldValue = newValue;
    }

    isDirty(): boolean {
        return this.oldValue !== this.getValue();
    }

    beginTracking(): void {
        this.tracking = true;
        this.oldValue = this.newValue = this.getValue();
        this.dirtyChecker.addProperty(this);
    }

    endTracking(): void {
        this.tracking = false;
        this.dirtyChecker.removeProperty(this);
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        var callbacks = this.callbacks,
            that = this;

        callbacks.push(callback);

        if (!this.tracking) {
            this.beginTracking();
        }

        return function () {
            callbacks.splice(callbacks.indexOf(callback), 1);
            if (callbacks.length === 0) {
                that.endTracking();
            }
        };
    }
}
