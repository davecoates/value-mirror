// @flow
import type {ValueDescription, RemoteObjectId } from './types';
import {
    serializeBoolean, serializeNumber, serializeString, serializeUndefined, serializeSymbol,
} from './serializePrimitive';
import serializeObject from './serializeObject';

const valuesByObjectId = new Map();
const objectIdByValue = new WeakMap();

let nextObjectId = 1;

function acquireObjectId(value:any) : RemoteObjectId {
    if (objectIdByValue.has(value)) {
        return objectIdByValue.get(value);
    }
    const objectId = nextObjectId++;
    valuesByObjectId.set(objectId, value);
    objectIdByValue.set(value, objectId);
    return objectId;
}

export default function serialize(value: any) : ValueDescription {
    const type = typeof(value);
    if (type === 'boolean') {
        return serializeBoolean(value);
    }
    if (type === 'number') {
        return serializeNumber(value);
    }
    if (type === 'string') {
        return serializeString(value);
    }
    if (type === 'undefined') {
        return serializeUndefined(value);
    }
    if (type === 'symbol') {
        return serializeSymbol(value);
    }
    if (typeof(value) == 'object') {
        if (value === null) {
            if (value === null) {
                return {
                    type: 'object',
                    subType: 'null',
                };
            }
        }
        return serializeObject(value, acquireObjectId(value));
    }

    throw new Error(`Unknown typeof value ${type}`);
}
