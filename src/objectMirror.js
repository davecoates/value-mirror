// @flow
import type { ObjectMirror, RemoteObjectId, LiveMirrorMaker } from './types';

export default function objectMirror(value: {}, objectId: RemoteObjectId, makeMirror: LiveMirrorMaker) : ObjectMirror {
    if (value === null) {
        return {
            type: 'object',
            subType: 'null',
        };
    }
    return {
        type: 'object',
        objectId,
    };
}
