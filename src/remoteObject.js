// @flow
import type { RemoteObjectId } from './types';

// Maintain a reference to an object while it is still needed (eg. not fully expanded)
const objectById = new Map();
// Store object id by object so we can reuse ID's if same value is passed again
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

export function releaseObject(objectId: RemoteObjectId) : boolean {
    return objectById.delete(objectId);
}

export function getObjectId(value: any) : ?RemoteObjectId {
    return idByObject.get(value);
}
