import {IMapChangeRecord} from './interfaces';

function newRecord<K, V>(type: string, object: Map<K, V>, key: K, oldValue?: V): IMapChangeRecord {
    return {
        type: type,
        object: object,
        key: key,
        oldValue: oldValue
    };
}

export function getChangeRecords<K, V>(map: Map<K, V>): IMapChangeRecord[] {
    var entries: IMapChangeRecord[] = [];
    for (var key of <any>map.keys()) {
        entries.push(newRecord('added', map, key));
    }
    return entries;
}
