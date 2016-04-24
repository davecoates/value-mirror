import { unserializeNumber } from './serializePrimitive';

export const $mirrorMeta = Symbol('MirrorMeta');
export const $mirrorEntriesFetched = Symbol('mirrorEntriesFetched');

const valueByObjectId = new Map();
// TODO:
// How will this work? Should I just retain plain primitives or wrap them in object?
// I think objects have to have a wrapper object with meta data (eg. size of list).
// Or could do it with a symbol?
export default function mirror(serializedData) {
    if (typeof(value) == 'string') {
        serializedData = JSON.parse(serializedData); // eslint-disable-line
    }
    switch (serializedData.type) {
        case 'number':
            return unserializeNumber(serializedData.value);
        case 'string':
        case 'boolean':
            return serializedData.value;
        case 'undefined':
            return undefined;
        case 'object':
            if (serializedData.subType === 'null') {
                return null;
            }
            const { objectId, subType, className, size } = serializedData;
            let value;
            if (valueByObjectId.has(objectId)) {
                value = valueByObjectId.get(objectId);
            } else {
                switch (subType) {
                    case 'map':
                        value = new Map();
                        value[$mirrorMeta] = {
                            objectId,
                            className,
                            size,
                            done: size === 0,
                        };
                        value[$mirrorEntriesFetched] = payload => {
                            const { result, done } = payload;
                            result.forEach(([k, v]) => value.set(k, v));
                            value[$mirrorMeta].done = done;
                        };
                        break;
                    case 'list':
                        value = [];
                        value[$mirrorMeta] = {
                            objectId,
                            className,
                            size,
                        };
                        break;
                    case 'set':
                        value = new Set();
                        value[$mirrorMeta] = {
                            objectId,
                            className,
                            size,
                        };
                        break;
                    default:
                        value = {};
                        value[$mirrorMeta] = {
                            objectId,
                            fetchedProperties: false,
                            className,
                        };
                }
            }
            return value;
        default:
            throw new Error(`Unexpected type of ${serializedData.type}`);
    }
}
