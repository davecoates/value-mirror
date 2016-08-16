// @flow
/* eslint-disable no-use-before-define */
import { unserializeNumber } from './serializePrimitive';
import type {
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

    constructor(data:ValueDescriptor, client:MirrorClient) {
        this.serializedRepresentation = data;
        this.type = data.type;
        this.client = client;
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

class CollectionMirror extends ObjectMirror {

    allEntriesFetched = false;
    size:?number;
    iteratorId:?number;

    constructor(data:ValueDescriptor, client:MirrorClient) {
        super(data, client);
        if (data.size) {
            this.size = unserializeNumber(data.size);
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
            return payload;
        });
    }

    addEntries(entries:[any]) { // eslint-disable-line no-unused-vars
        throw new Error('Not implemented; you must implement addEntries for Collectionmirror');
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

export default function buildMirror(data:ValueDescriptor, client:MirrorClient) : ?MirrorType {
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
        case 'object': {
            const { objectId, subType } = serializedRepresentation;
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
                    default:
                        value = new ObjectMirror(serializedRepresentation, client);
                }
                valueByObjectId.set(objectId, value);
            }
            return valueByObjectId.get(objectId);
        }
        case 'function':
            return new FunctionMirror(serializedRepresentation, client);
        case 'symbol':
            return new SymbolMirror(serializedRepresentation, client);
        default:
            throw new Error(`Unexpected value type '${serializedRepresentation.type}'`);
    }
}
