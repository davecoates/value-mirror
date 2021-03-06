// @flow
import type { ObjectSerializer, ValueDescriptor } from './types';
import { acquireObjectId } from './remoteObject';
import {
    serializeBoolean, serializeNumber, serializeString, serializeUndefined, serializeSymbol,
} from './serializePrimitive';
import serializeObject from './serializeObject';
import serializeFunction from './serializeFunction';

let customObjectSerializer:?ObjectSerializer = null;
export function registerObjectSerializer(fn: ObjectSerializer) {
    if (customObjectSerializer != null) {
        const existingSerializer = customObjectSerializer;
        customObjectSerializer = (value:Object) => {
            const result = !existingSerializer(value);
            if (result) {
                return result;
            }
            return fn(value);
        };
    } else {
        customObjectSerializer = fn;
    }
}

export default function serialize(value: any) : ValueDescriptor {
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
                    type: 'null',
                };
            }
        }
        return serializeObject(value, acquireObjectId(value), customObjectSerializer);
    }
    if (typeof(value) == 'function') {
        return serializeFunction(value);
    }

    throw new Error(`Unknown typeof value ${type}`);
}
