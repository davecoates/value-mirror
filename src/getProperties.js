// @flow
import type { RemoteObjectId, ObjectPropertyDescriptor } from './types';
import { getObject } from './remoteObject';
import serialize from './serialize';

export default function getProperties(objectId: RemoteObjectId) : Array<ObjectPropertyDescriptor> {
    const object = getObject(objectId);
    if (!object) {
        throw new Error('Object does not exist');
    }

    const properties = [];
    const obj = getObject(objectId);
    for (const key in obj) {
        const value = serialize(obj[key]);
        let isRecursive = false;
        if (value.type === 'object' && value.objectId != null) {
            isRecursive = value.objectId === objectId;
        }
        properties.push({ key, value, isRecursive });
    }
    return properties;
}
