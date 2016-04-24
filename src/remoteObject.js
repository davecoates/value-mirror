// @flow
import type { RemoteObjectId } from './types';
const objectById = new Map();
const idByObject = new WeakMap();

let nextObjectId = 1;

export function acquireObjectId(value:any) : RemoteObjectId {
    if (idByObject.has(value)) {
        return idByObject.get(value);
    }
    const objectId = nextObjectId++;
    objectById.set(objectId, value);
    idByObject.set(value, objectId);
    return objectId;
}

export function getObject(objectId: RemoteObjectId) : any {
    return objectById.get(objectId);
}
