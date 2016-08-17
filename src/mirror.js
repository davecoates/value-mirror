// @flow
/* eslint-disable no-use-before-define */
import invariant from 'invariant';
import { unserializeNumber } from './serializePrimitive';
import type {
    ObjectDescriptor, RegExpDescriptor,
    ObjectPropertyDescriptor, RemoteObjectId, EntriesDescriptor, ValueDescriptor,
} from './types';
import type { GetEntriesConfig } from './getEntries';

const valueByObjectId = new Map();

interface MirrorClient {
    getEntries: (
        objectId: RemoteObjectId,
        iteratorId: ?number,
        config:GetEntriesConfig
    ) => Promise<EntriesDescriptor>;
    getProperties: (objectId:number) => Promise<Array<ObjectPropertyDescriptor>>;
}

class Mirror {

    serializedRepresentation:ValueDescriptor;
    client:MirrorClient;
    type:string;
    subType:?string;

    constructor(data:ValueDescriptor, client:MirrorClient) {
        this.serializedRepresentation = data;
        this.type = data.type;
        if (data.subType) {
            this.subType = data.subType;
        }
        this.client = client;
    }

    synchronise(mirror:Mirror) { // eslint-disable-line no-unused-vars
        throw new Error('Not implemented');
    }

}

type MirrorType = boolean | string | null | number | Mirror;

type ObjectProperty = {
    key:string;
    value:?MirrorType;
    isRecursive:boolean;
}

export class ObjectMirror extends Mirror {

    properties:Array<ObjectProperty>;
    objectId:RemoteObjectId;

    constructor(data:ValueDescriptor, client:MirrorClient) {
        super(data, client);
        if (data.type !== 'object' || data.objectId == null) {
            throw new Error('ObjectMirror initialised with wrong type: ' + data.type);
        }
        this.objectId = data.objectId;
    }

    getProperties() : Promise<Array<ObjectPropertyDescriptor>> {
        return this.client.getProperties(this.objectId).then(properties => {
            this.properties = properties.map(({ key, value, isRecursive }) => ({
                key, value: buildMirror(value, this.client), isRecursive,
            }));
            return properties;
        });
    }

}

class DateMirror extends ObjectMirror {

    value: ?number;

    constructor(data:ValueDescriptor, client:MirrorClient) {
        super(data, client);
        if (typeof data.value == 'number') {
            this.value = data.value;
        }
    }
}

class RegExpMirror extends ObjectMirror {

    source: string;
    flags: Array<string>;

    constructor(data:ObjectDescriptor, client:MirrorClient) {
        super(data, client);
        if (data.value && typeof(data.value) == 'object') {
            this.source = data.value.source;
            this.flags = data.value.flags;
        }
    }
}

class CollectionMirror extends ObjectMirror {

    allEntriesFetched = false;
    size:?number;
    iteratorId:?number;

    constructor(data:ValueDescriptor, client:MirrorClient) {
        super(data, client);
        if (data.size != null) {
            this.size = unserializeNumber(data.size);
        }
        if (this.size === 0) {
            this.allEntriesFetched = true;
        }
    }

    getEntries(config = {}) : Promise<EntriesDescriptor> {
        if (this.allEntriesFetched) {
            return Promise.reject('All entries fetched');
        }
        return this.client.getEntries(this.objectId, this.iteratorId, config).then(payload => {
            const { result, done, iteratorId } = payload;
            this.iteratorId = iteratorId;
            this.allEntriesFetched = done;
            this.addEntries(result);
            if (done && this.size == null) {
                this.size = this.fetchedCount();
            }
            return payload;
        });
    }

    addEntries(entries:[any]) { // eslint-disable-line no-unused-vars
        throw new Error('Not implemented; you must implement addEntries for Collectionmirror');
    }

    fetchedCount() : number {
        throw new Error('Not implemented; you must implement fetchedCount for CollectionMirror');
    }

}

export class MapMirror extends CollectionMirror {

    value:Map<any, any> = new Map();

    fetchedCount() : number {
        return this.value.size;
    }

    addEntries(entries:[any]) {
        entries.forEach(([k, v]) => this.value.set(
            buildMirror(k, this.client), buildMirror(v, this.client)));
    }

}

export class ListMirror extends CollectionMirror {

    value:[any] = [];

    fetchedCount() : number {
        return this.value.length;
    }

    addEntries(result:[any]) {
        this.value.push(...result.map(v => buildMirror(v, this.client)));
    }

}

export class SetMirror extends CollectionMirror {

    value:Set<any> = new Set();

    fetchedCount() : number {
        return this.value.size;
    }

    addEntries(result:[any]) {
        result.forEach(v => this.value.add(buildMirror(v, this.client)));
    }

}

export class FunctionMirror extends Mirror {
}

export class SymbolMirror extends Mirror {
}

function  buildObjectMirror(serializedRepresentation:ObjectDescriptor, client:MirrorClient) : ?MirrorType {
    const { subType, objectId } = serializedRepresentation;
    if (!valueByObjectId.has(objectId)) {
        let value;
        switch (subType) {
            case 'map':
                value = new MapMirror(serializedRepresentation, client);
                break;
            case 'list':
            case 'iterable':
                value = new ListMirror(serializedRepresentation, client);
                break;
            case 'set':
                value = new SetMirror(serializedRepresentation, client);
                break;
            case 'date':
                value = new DateMirror(serializedRepresentation, client);
                break;
            case 'regexp':
                value = new RegExpMirror(serializedRepresentation, client);
                break;
            default:
                value = new ObjectMirror(serializedRepresentation, client);
        }
        valueByObjectId.set(objectId, value);
    }
    return valueByObjectId.get(objectId);
}

export default function buildMirror(data:ValueDescriptor, client:MirrorClient) : ?MirrorType {
    invariant(client && typeof(client) == 'object', 'You must provide a client');
    invariant(typeof client.getEntries == 'function', 'Client must implement getEntries function');
    invariant(
        typeof client.getProperties == 'function',
        'Client must implement getProperties function'
    );
    const serializedRepresentation:ValueDescriptor = data;
    switch (serializedRepresentation.type) {
        case 'number':
            return unserializeNumber(serializedRepresentation.value);
        case 'string':
        case 'boolean':
            return serializedRepresentation.value;
        case 'undefined':
            return undefined;
        case 'null':
            return null;
        case 'object':
            return buildObjectMirror(serializedRepresentation, client);
        case 'function':
            return new FunctionMirror(serializedRepresentation, client);
        case 'symbol':
            return new SymbolMirror(serializedRepresentation, client);
        default:
            throw new Error(`Unexpected value type '${serializedRepresentation.type}'`);
    }
}
