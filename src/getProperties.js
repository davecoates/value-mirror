// @flow
import type { EntriesDescriptor, RemoteObjectId } from './types';
import { getObject } from './remoteObject';
import serialize from './serialize';

export default function getProperties(objectId: RemoteObjectId) {
    const object = getObject(objectId);
    if (!object) {
        throw new Error('Object does not exist');
    }

    const properties = [];
    const obj = getObject(objectId);
    for (const p in obj) {
        const serialized = serialize(obj[p]);
        let recursive = false;
        if (serialized.type == 'object' && serialized.objectId != null) {
            recursive = serialized.objectId === objectId;
        }
        properties.push([p, serialized, recursive]);
    }
    return properties;
}
