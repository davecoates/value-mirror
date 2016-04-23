// @flow
import type { ObjectDescription, RemoteObjectId, Serializer } from './types';

function serializeArray(value: any[], objectId: RemoteObjectId) : ObjectDescription {
    return {
        type: 'object',
        subType: 'array',
        objectId,
        size: value.length,
    };
}

export default function serializeObject(value: {}, objectId: RemoteObjectId, serialize: Serializer) : ObjectDescription {
    if (Array.isArray(value)) {
        return serializeArray(value, objectId);
    }
    return {
        type: 'object',
        objectId,
    };
}
