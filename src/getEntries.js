// @flow
import type { ValueDescriptor, EntriesValueDescriptor, EntriesDescriptor, RemoteObjectId } from './types';
import { getObject } from './remoteObject';
import serialize from './serialize';

export type GetEntriesConfig = {
    limit?: number;
}

type ObjectIteratorDescriptor = {
    iterator: Iterator<*>;
    consumedCount: number;
}

type ObjectIterators = Map<number, ObjectIteratorDescriptor>;
const iteratorsByObject:WeakMap<Object, ObjectIterators> = new WeakMap();

function acquireIterator(object: Object, iteratorId) : [boolean, Iterator<any>] {
    if (iteratorId != null && iteratorsByObject.has(object)) {
        const iteratorDescriptor = iteratorsByObject.get(object).get(iteratorId);
        if (iteratorDescriptor) {
            return [false, iteratorDescriptor.iterator];
        }
    }
    return [true, object[Symbol.iterator]()];
}

export default function getEntries(
    objectId: RemoteObjectId,
    iteratorId: ?number = null,
    config:GetEntriesConfig = {}
) : EntriesDescriptor {
    const object = getObject(objectId);
    if (!object) {
        throw new Error('Object does not exist');
    }
    if (!object[Symbol.iterator]) {
        throw new Error('Object is not iterable');
    }
    const objectDescriptor = serialize(object);
    if (objectDescriptor.type != 'object') {
        throw new Error('Invalid object found; was not serialized to expected type');
    }
    let totalEntries = null;
    const limit = config.limit;
    let size;
    // This it to appease flow - doing it in one condition below didn't work
    if (objectDescriptor.size != null) {
        size = objectDescriptor.size;
    }
    if (size !== 'Infinity') {
        totalEntries = objectDescriptor.size;
    } else if (!limit) {
        // TODO: Alternatively just iterate to fixed 'safe' limit and throw?
        throw new Error('Potentially infinite collection; you must specify a limit');
    }

    const [isNewIterator, it] = acquireIterator(object, iteratorId);
    let n = it.next();
    const values = [];

    while (!n.done) {
        let subType = null;
        // This is to appease flow - doing it in one condition below didn't
        // work for some reason
        if (objectDescriptor.subType != null) {
            subType = objectDescriptor.subType;
        }
        if (subType === 'map') {
            values.push([serialize(n.value[0]), serialize(n.value[1])]);
        } else {
            values.push(serialize(n.value));
        }
        if (limit && values.length >= limit) {
            break;
        }
        n = it.next();
    }

    let iteratorData;
    let done = n.done;
    if (!done) {
        if (!iteratorsByObject.has(object)) {
            iteratorsByObject.set(object, new Map());
        }
        const iterators = iteratorsByObject.get(object);
        let id = iteratorId;
        let iteratorDesc = id != null && iterators.get(id);
        if (!iteratorDesc) {
            id = iterators.size;
            iteratorDesc = {
                iterator: it,
                consumedCount: 0,
            };
            iterators.set(id, iteratorDesc);
        }
        iteratorDesc.consumedCount += values.length;
        iteratorData = { iteratorId: id };
        // If we know the size of the iterator check if we have actually consumed it all
        if (totalEntries && totalEntries === iteratorDesc.consumedCount) {
            done = true;
            iteratorData = null;
        }
    }

    return {
        objectId,
        isNewIterator,
        result: values,
        done,
        ...iteratorData,
    };
}
