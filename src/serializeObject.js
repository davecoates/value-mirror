// @flow
import type {
    IterableDescriptor, MapDescriptor, SetDescriptor, DateDescriptor,
    RegExpDescriptor, ObjectSerializer, ObjectDescriptor, RemoteObjectId,
} from './types';
import { serializableNumberRepresentation } from './serializePrimitive';

function serializeArray(value: any[], objectId: RemoteObjectId) : ObjectDescriptor {
    return {
        type: 'object',
        className: 'Array',
        subType: 'list',
        objectId,
        size: value.length,
    };
}

function serializeMap(value: Map<any, any>, objectId: RemoteObjectId) : MapDescriptor {
    return {
        type: 'object',
        className: value.constructor.name,
        subType: 'map',
        objectId,
        size: serializableNumberRepresentation(value.size),
    };
}

function serializeSet(value: Set<*>, objectId: RemoteObjectId) : SetDescriptor {
    return {
        type: 'object',
        className: value.constructor.name,
        subType: 'set',
        objectId,
        size: serializableNumberRepresentation(value.size),
    };
}

function serializeDate(value: Date, objectId: RemoteObjectId) : DateDescriptor {
    return {
        type: 'object',
        className: value.constructor.name,
        subType: 'date',
        value: value.getTime(),
        objectId,
    };
}

function serializeRegExp(value: RegExp, objectId: RemoteObjectId) : RegExpDescriptor {
    const { source } = value;
    // In node at least prototype.flags is never set; try construct from
    // available boolean properties
    const flags = [];
    if (value.global) flags.push('g');
    if (value.ignoreCase) flags.push('i');
    if (value.multiline) flags.push('m');
    return {
        type: 'object',
        className: value.constructor.name,
        subType: 'regexp',
        value: {
            source,
            flags: flags.join(''),
        },
        objectId,
    };
}

function serializeIterable(value: Object, objectId: RemoteObjectId) : IterableDescriptor {
    return {
        type: 'object',
        subType: 'iterable',
        objectId,
    };
}

function ensureJsonSerializable(object:Object) {
    if (object.size) {
        // Ensure that size is serializable - eg. Infinity for infinite collections
        object.size = serializableNumberRepresentation(object.size);
    }
    return object;
}

export default function serializeObject(value: Object, objectId: RemoteObjectId, customObjectSerializer: ?ObjectSerializer = null) : ObjectDescriptor {
    if (customObjectSerializer) {
        const result = customObjectSerializer(value, objectId);
        if (result) {
            return ensureJsonSerializable(result);
        }
    }
    if (Array.isArray(value)) {
        return serializeArray(value, objectId);
    }
    if (value instanceof Map) {
        return serializeMap(value, objectId);
    }
    if (value instanceof Set) {
        return serializeSet(value, objectId);
    }
    if (value instanceof Date) {
        return serializeDate(value, objectId);
    }
    if (value instanceof RegExp) {
        return serializeRegExp(value, objectId);
    }
    if (value[Symbol.iterator]) {
        return serializeIterable(value, objectId);
    }
    return {
        type: 'object',
        subType: null,
        objectId,
    };
}
