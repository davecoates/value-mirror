// @flow
import type { ObjectSerializer, ValueDescriptor } from './types';
import { acquireObjectId } from './remoteObject';
import {
    serializeBoolean, serializeNumber, serializeString, serializeUndefined, serializeSymbol,
} from './serializePrimitive';
import serializeObject from './serializeObject';

export default function serialize(value: any, customObjectSerializer: ?ObjectSerializer = null) : ValueDescriptor {
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
        return serializeObject(value, acquireObjectId(value), customObjectSerializer);
    }

    throw new Error(`Unknown typeof value ${type}`);
}
