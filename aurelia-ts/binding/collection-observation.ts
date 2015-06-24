import {IPropertyObserver, IValueChangedCallback, IUnsubscribe, IMapChangeRecord, IArrayChangeRecord, ICollectionChangedCallback, IArrayObserveChangeRecord} from './interfaces';

import {TaskQueue, ITask} from 'aurelia-task-queue';
import {calcSplices, projectArraySplices} from './array-change-records';
import {getChangeRecords} from './map-change-records';

export class ModifyCollectionObserver<T extends Map<any, any> | ArrayLike<any>, R extends IArrayChangeRecord | IMapChangeRecord> implements ITask {
    public taskQueue: TaskQueue;
    public queued: boolean;
    public callbacks: ICollectionChangedCallback<R>[];
    public changeRecords: (IArrayObserveChangeRecord | IMapChangeRecord)[];
    public oldCollection: T;
    public collection: T;
    public lengthPropertyName: string;
    public lengthObserver: CollectionLengthObserver;
    public array: void;
    constructor(taskQueue: TaskQueue, collection: T) {
        this.taskQueue = taskQueue;
        this.queued = false;
        this.callbacks = [];
        this.changeRecords = [];
        this.oldCollection = null;
        this.collection = collection;
        this.lengthPropertyName = collection instanceof Map ? 'size' : 'length';
    }

    subscribe(callback: ICollectionChangedCallback<R>): IUnsubscribe {
        var callbacks = this.callbacks;
        callbacks.push(callback);
        return function () {
            callbacks.splice(callbacks.indexOf(callback), 1);
        };
    }

    addChangeRecord(changeRecord: (IArrayObserveChangeRecord | IMapChangeRecord)): void {
        if (this.callbacks.length === 0 && !this.lengthObserver) {
            return;
        }

        this.changeRecords.push(changeRecord);

        if (!this.queued) {
            this.queued = true;
            this.taskQueue.queueMicroTask(this);
        }
    }

    reset(oldCollection: T): void {
        if (!this.callbacks.length) {
            return;
        }

        this.oldCollection = oldCollection;

        if (!this.queued) {
            this.queued = true;
            this.taskQueue.queueMicroTask(this);
        }
    }

    getLengthObserver() {
        return this.lengthObserver || (this.lengthObserver = new CollectionLengthObserver(this.collection));
    }

    call(): void {
        var callbacks = this.callbacks,
            i = callbacks.length,
            changeRecords = this.changeRecords,
            oldCollection = this.oldCollection,
            records: R[];

        this.queued = false;
        this.changeRecords = [];
        this.oldCollection = null;

        if (i) {
            if (oldCollection) {
                // TODO (martingust) we might want to refactor this to a common, independent of collection type, way of getting the records
                if (this.collection instanceof Map) {
                    records = <any>getChangeRecords(<Map<any, any>><any>oldCollection);
                } else {
                    //we might need to combine this with existing change records....
                    records = <any>calcSplices(<ArrayLike<any>><any>this.collection, 0, (<ArrayLike<any>><any>this.collection).length, <ArrayLike<any>><any>oldCollection, 0, (<ArrayLike<any>><any>oldCollection).length);
                }
            } else {
                if (this.collection instanceof Map) {
                    records = <any><IMapChangeRecord[]>changeRecords;
                } else {
                    records = <any>projectArraySplices(<ArrayLike<any>><any>this.collection, <IArrayObserveChangeRecord[]>changeRecords);
                }
            }

            while (i--) {
                callbacks[i](records);
            }
        }

        if (this.lengthObserver) {
            this.lengthObserver.call(this.collection[this.lengthPropertyName]);
        }
    }
}

export class CollectionLengthObserver implements IPropertyObserver {
    public collection: Map<any, any> | ArrayLike<any>;
    public callbacks: IValueChangedCallback[];
    public lengthPropertyName: string;
    public currentValue: number;
    constructor(collection: Map<any, any> | ArrayLike<any>) {
        this.collection = collection;
        this.callbacks = [];
        this.lengthPropertyName = collection instanceof Map ? 'size' : 'length';
        this.currentValue = collection[this.lengthPropertyName];
    }

    getValue(): number {
        return this.collection[this.lengthPropertyName];
    }

    setValue(newValue: number): void {
        this.collection[this.lengthPropertyName] = newValue;
    }

    subscribe(callback: IValueChangedCallback): IUnsubscribe {
        var callbacks = this.callbacks;
        callbacks.push(callback);
        return function () {
            callbacks.splice(callbacks.indexOf(callback), 1);
        };
    }

    call(newValue: number) {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.currentValue;

        while (i--) {
            callbacks[i](newValue, oldValue);
        }

        this.currentValue = newValue;
    }
}
