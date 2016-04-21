// @flow
import type { LiveMirror, Mirror, RemoteObjectId } from './types';
import {
    booleanMirror, numberMirror, stringMirror, undefinedMirror, symbolMirror,
} from './primitiveMirrors';
import makeObjectMirror from './objectMirror';

let nextObjectId = 0;

let liveMirrors:{[key:RemoteObjectId]:LiveMirror} = {};

export default class ValueMirror {
    value: any;
    objectId: ?RemoteObjectId;

    constructor(value: any) {
        this.value = value;
    }

    serialize() : Mirror {
        let mirror:Mirror;
        if (typeof(this.value) == 'boolean') {
            mirror = booleanMirror(this.value);
        } else if (typeof(this.value) == 'number') {
            mirror = numberMirror(this.value);
        } else if (typeof(this.value) == 'string') {
            mirror = stringMirror(this.value);
        } else if (typeof(this.value) == 'undefined') {
            mirror = undefinedMirror(this.value);
        }
        // $FlowIssue: https://github.com/facebook/flow/issues/1015
        else if (typeof(this.value) == 'symbol') { // eslint-disable-line
            mirror = symbolMirror(this.value);
        } else {
            this.objectId = nextObjectId;
            liveMirrors[nextObjectId++] = this;
            return makeObjectMirror(this.value, nextObjectId, value => new ValueMirror(value));
        }
        return mirror;
    }

}
