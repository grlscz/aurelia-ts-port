import {IObjectObserve, IObjectObserveChangeRecord, IArrayObserve, IArrayObserveChangeRecord} from './interfaces';

export var hasObjectObserve = (function detectObjectObserve() {
    if (typeof (<IObjectObserve>Object).observe !== 'function') {
        return false;
    }

    var records: IObjectObserveChangeRecord[] = [];

    function callback(recs: IObjectObserveChangeRecord[]) {
        records = recs;
    }

    var test: any = {};
    (<IObjectObserve>Object).observe(test, callback);
    test.id = 1;
    test.id = 2;
    delete test.id;

    (<IObjectObserve>Object).deliverChangeRecords(callback);
    if (records.length !== 3)
        return false;

    if (records[0].type != 'add' ||
        records[1].type != 'update' ||
        records[2].type != 'delete') {
        return false;
    }

    (<IObjectObserve>Object).unobserve(test, callback);

    return true;
})();

export var hasArrayObserve = (function detectArrayObserve() {
    if (typeof (<IArrayObserve>Array).observe !== 'function') {
        return false;
    }

    var records: IArrayObserveChangeRecord[] = [];

    function callback(recs) {
        records = recs;
    }

    var arr = [];
    (<IArrayObserve>Array).observe(arr, callback);
    arr.push(1, 2);
    arr.length = 0;

    (<IObjectObserve>Object).deliverChangeRecords(callback);
    if (records.length !== 2)
        return false;

    if (records[0].type != 'splice' ||
        records[1].type != 'splice') {
        return false;
    }

    (<IArrayObserve>Array).unobserve(arr, callback);

    return true;
})();
