import {IMapChangeRecord, IMapObserver} from './interfaces';
import {TaskQueue} from 'aurelia-task-queue';

import core from 'core-js'
import {getChangeRecords} from './map-change-records';
import {ModifyCollectionObserver} from './collection-observation';

var mapProto = Map.prototype;

export function getMapObserver(taskQueue: TaskQueue, map: Map<any, any>): IMapObserver {
    return ModifyMapObserver.create(taskQueue, map);
}

class ModifyMapObserver extends ModifyCollectionObserver<Map<any, any>, IMapChangeRecord> implements IMapObserver {
    constructor(taskQueue: TaskQueue, map: Map<any, any>) {
        super(taskQueue, map);
    }

    static create(taskQueue: TaskQueue, map: Map<any, any>): ModifyMapObserver {
        var observer = new ModifyMapObserver(taskQueue, map);

        map['set'] = function () {
            var oldValue = map.get(arguments[0]);
            var type = oldValue ? 'update' : 'add';
            var methodCallResult = mapProto['set'].apply(map, arguments);
            observer.addChangeRecord({
                type: type,
                object: map,
                key: arguments[0],
                oldValue: oldValue
            });
            return methodCallResult;
        }

        map['delete'] = function () {
            var oldValue = map.get(arguments[0]);
            var methodCallResult = mapProto['delete'].apply(map, arguments);
            observer.addChangeRecord({
                type: 'delete',
                object: map,
                key: arguments[0],
                oldValue: oldValue
            });
            return methodCallResult;
        }

        map['clear'] = function () {
            var methodCallResult = mapProto['clear'].apply(map, arguments);
            observer.addChangeRecord({
                type: 'clear',
                object: map
            });
            return methodCallResult;
        }

        return observer;
    }
}
