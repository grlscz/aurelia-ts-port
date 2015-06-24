import {IArrayObserveChangeRecord, IArrayChangeRecord, __EditKind, I__ArraySplice} from './interfaces'

function isIndex(s: any): boolean {
    return +s === s >>> 0;
}

function toNumber(s: any): number {
    return +s;
}

function newSplice(index: number, removed: any[], addedCount: number): IArrayChangeRecord {
    return {
        index: index,
        removed: removed,
        addedCount: addedCount
    };
}

var EDIT_LEAVE: __EditKind = 0;
var EDIT_UPDATE: __EditKind = 1;
var EDIT_ADD: __EditKind = 2;
var EDIT_DELETE: __EditKind = 3;

function ArraySplice() { }

ArraySplice.prototype = <I__ArraySplice>{
    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    calcEditDistances: function (current: ArrayLike<any>, currentStart: number, currentEnd: number, old: ArrayLike<any>, oldStart: number, oldEnd: number): number[][] {
        // "Deletion" columns
        var rowCount = oldEnd - oldStart + 1;
        var columnCount = currentEnd - currentStart + 1;
        var distances: number[][] = new Array(rowCount);
        var i: number, j: number, north: number, west: number;

        // "Addition" rows. Initialize null column.
        for (i = 0; i < rowCount; ++i) {
            distances[i] = new Array(columnCount);
            distances[i][0] = i;
        }

        // Initialize null row
        for (j = 0; j < columnCount; ++j) {
            distances[0][j] = j;
        }

        for (i = 1; i < rowCount; ++i) {
            for (j = 1; j < columnCount; ++j) {
                if ((<I__ArraySplice>this).equals(current[currentStart + j - 1], old[oldStart + i - 1]))
                    distances[i][j] = distances[i - 1][j - 1];
                else {
                    north = distances[i - 1][j] + 1;
                    west = distances[i][j - 1] + 1;
                    distances[i][j] = north < west ? north : west;
                }
            }
        }

        return distances;
    },

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    spliceOperationsFromEditDistances: function (distances: number[][]): __EditKind[] {
        var i = distances.length - 1;
        var j = distances[0].length - 1;
        var current = distances[i][j];
        var edits: __EditKind[] = [];
        while (i > 0 || j > 0) {
            if (i == 0) {
                edits.push(EDIT_ADD);
                j--;
                continue;
            }
            if (j == 0) {
                edits.push(EDIT_DELETE);
                i--;
                continue;
            }
            var northWest = distances[i - 1][j - 1];
            var west = distances[i - 1][j];
            var north = distances[i][j - 1];

            var min: number;
            if (west < north)
                min = west < northWest ? west : northWest;
            else
                min = north < northWest ? north : northWest;

            if (min == northWest) {
                if (northWest == current) {
                    edits.push(EDIT_LEAVE);
                } else {
                    edits.push(EDIT_UPDATE);
                    current = northWest;
                }
                i--;
                j--;
            } else if (min == west) {
                edits.push(EDIT_DELETE);
                i--;
                current = west;
            } else {
                edits.push(EDIT_ADD);
                j--;
                current = north;
            }
        }

        edits.reverse();
        return edits;
    },

    /**
     * Splice Projection functions:
     *
     * A splice map is a representation of how a previous array of items
     * was transformed into a new array of items. Conceptually it is a list of
     * tuples of
     *
     *   <index, removed, addedCount>
     *
     * which are kept in ascending index order of. The tuple represents that at
     * the |index|, |removed| sequence of items were removed, and counting forward
     * from |index|, |addedCount| items were added.
     */

    /**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     */
    calcSplices: function (current: ArrayLike<any>, currentStart: number, currentEnd: number, old: ArrayLike<any>, oldStart: number, oldEnd: number): IArrayChangeRecord[] {
        var prefixCount = 0;
        var suffixCount = 0;

        var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
        if (currentStart == 0 && oldStart == 0)
            prefixCount = (<I__ArraySplice>this).sharedPrefix(current, old, minLength);

        if (currentEnd == current.length && oldEnd == old.length)
            suffixCount = (<I__ArraySplice>this).sharedSuffix(current, old, minLength - prefixCount);

        currentStart += prefixCount;
        oldStart += prefixCount;
        currentEnd -= suffixCount;
        oldEnd -= suffixCount;

        if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
            return [];

        if (currentStart == currentEnd) {
            var splice: IArrayChangeRecord = newSplice(currentStart, [], 0);
            while (oldStart < oldEnd)
                splice.removed.push(old[oldStart++]);

            return [splice];
        } else if (oldStart == oldEnd)
            return [newSplice(currentStart, [], currentEnd - currentStart)];

        var ops = (<I__ArraySplice>this).spliceOperationsFromEditDistances(
            (<I__ArraySplice>this).calcEditDistances(current, currentStart, currentEnd,
                old, oldStart, oldEnd));

        var splice: IArrayChangeRecord = undefined;
        var splices: IArrayChangeRecord[] = [];
        var index = currentStart;
        var oldIndex = oldStart;
        for (var i = 0; i < ops.length; ++i) {
            switch (ops[i]) {
                case EDIT_LEAVE:
                    if (splice) {
                        splices.push(splice);
                        splice = undefined;
                    }

                    index++;
                    oldIndex++;
                    break;
                case EDIT_UPDATE:
                    if (!splice)
                        splice = newSplice(index, [], 0);

                    splice.addedCount++;
                    index++;

                    splice.removed.push(old[oldIndex]);
                    oldIndex++;
                    break;
                case EDIT_ADD:
                    if (!splice)
                        splice = newSplice(index, [], 0);

                    splice.addedCount++;
                    index++;
                    break;
                case EDIT_DELETE:
                    if (!splice)
                        splice = newSplice(index, [], 0);

                    splice.removed.push(old[oldIndex]);
                    oldIndex++;
                    break;
            }
        }

        if (splice) {
            splices.push(splice);
        }
        return splices;
    },

    sharedPrefix: function (current: ArrayLike<any>, old: ArrayLike<any>, searchLength: number): number {
        for (var i = 0; i < searchLength; ++i)
            if (!(<I__ArraySplice>this).equals(current[i], old[i]))
                return i;
        return searchLength;
    },

    sharedSuffix: function (current: ArrayLike<any>, old: ArrayLike<any>, searchLength: number): number {
        var index1 = current.length;
        var index2 = old.length;
        var count = 0;
        while (count < searchLength && (<I__ArraySplice>this).equals(current[--index1], old[--index2]))
            count++;

        return count;
    },

    calculateSplices: function (current: any, previous: any): IArrayChangeRecord[] {
        return (<I__ArraySplice>this).calcSplices(current, 0, current.length, previous, 0,
            previous.length);
    },

    equals: function (currentValue: any, previousValue: any): boolean {
        return currentValue === previousValue;
    }
};

var arraySplice: I__ArraySplice = new ArraySplice();

export function calcSplices(current: ArrayLike<any>, currentStart: number, currentEnd: number, old: ArrayLike<any>, oldStart: number, oldEnd: number): IArrayChangeRecord[] {
    return arraySplice.calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd);
}

function intersect(start1: number, end1: number, start2: number, end2: number): number {
    // Disjoint
    if (end1 < start2 || end2 < start1)
        return -1;

    // Adjacent
    if (end1 == start2 || end2 == start1)
        return 0;

    // Non-zero intersect, span1 first
    if (start1 < start2) {
        if (end1 < end2)
            return end1 - start2; // Overlap
        else
            return end2 - start2; // Contained
    } else {
        // Non-zero intersect, span2 first
        if (end2 < end1)
            return end2 - start1; // Overlap
        else
            return end1 - start1; // Contained
    }
}

function mergeSplice(splices: IArrayChangeRecord[], index: number, removed: any[], addedCount: number): void {
    var splice = newSplice(index, removed, addedCount);

    var inserted = false;
    var insertionOffset = 0;

    for (var i = 0; i < splices.length; i++) {
        var current = splices[i];
        current.index += insertionOffset;

        if (inserted)
            continue;

        var intersectCount = intersect(splice.index,
            splice.index + splice.removed.length,
            current.index,
            current.index + current.addedCount);

        if (intersectCount >= 0) {
            // Merge the two splices

            splices.splice(i, 1);
            i--;

            insertionOffset -= current.addedCount - current.removed.length;

            splice.addedCount += current.addedCount - intersectCount;
            var deleteCount = splice.removed.length +
                current.removed.length - intersectCount;

            if (!splice.addedCount && !deleteCount) {
                // merged splice is a noop. discard.
                inserted = true;
            } else {
                var removed = current.removed;

                if (splice.index < current.index) {
                    // some prefix of splice.removed is prepended to current.removed.
                    var prepend = splice.removed.slice(0, current.index - splice.index);
                    Array.prototype.push.apply(prepend, removed);
                    removed = prepend;
                }

                if (splice.index + splice.removed.length > current.index + current.addedCount) {
                    // some suffix of splice.removed is appended to current.removed.
                    var append = splice.removed.slice(current.index + current.addedCount - splice.index);
                    Array.prototype.push.apply(removed, append);
                }

                splice.removed = removed;
                if (current.index < splice.index) {
                    splice.index = current.index;
                }
            }
        } else if (splice.index < current.index) {
            // Insert splice here.

            inserted = true;

            splices.splice(i, 0, splice);
            i++;

            var offset = splice.addedCount - splice.removed.length
            current.index += offset;
            insertionOffset += offset;
        }
    }

    if (!inserted)
        splices.push(splice);
}

function createInitialSplices(array: ArrayLike<any>, changeRecords: IArrayObserveChangeRecord[]): IArrayChangeRecord[] {
    var splices: IArrayChangeRecord[] = [];

    for (var i = 0; i < changeRecords.length; i++) {
        var record = changeRecords[i];
        switch (record.type) {
            case 'splice':
                mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
                break;
            case 'add':
            case 'update':
            case 'delete':
                if (!isIndex(record.name))
                    continue;
                var index = toNumber(record.name);
                if (index < 0)
                    continue;
                mergeSplice(splices, index, [record.oldValue], record.type === 'delete' ? 0 : 1);
                break;
            default:
                console.error('Unexpected record type: ' + JSON.stringify(record));
                break;
        }
    }

    return splices;
}

export function projectArraySplices(array: ArrayLike<any>, changeRecords: IArrayObserveChangeRecord[]): IArrayChangeRecord[] {
    var splices: IArrayChangeRecord[] = [];

    createInitialSplices(array, changeRecords).forEach(function (splice) {
        if (splice.addedCount == 1 && splice.removed.length == 1) {
            if (splice.removed[0] !== array[splice.index])
                splices.push(splice);

            return
        };

        splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
            splice.removed, 0, splice.removed.length));
    });

    return splices;
}
