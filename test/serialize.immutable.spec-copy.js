import serialize, {
    registerObjectSerializer, __RewireAPI__ as serializeRewireAPI,
} from '../src/serialize';
import Immutable from 'immutable';
import test from 'ava';

function immutableSerializer(value, objectId) {
    if (Immutable.Map.isMap(value)) {
        return {
            type: 'object',
            className: 'Map',
            subType: 'map',
            size: value.size,
            objectId,
        };
    }
    if (Immutable.Set.isSet(value)) {
        return {
            type: 'object',
            className: 'Set',
            subType: 'set',
            size: value.size,
            objectId,
        };
    }
    if (Immutable.List.isList(value)) {
        return {
            type: 'object',
            className: 'List',
            subType: 'list',
            size: value.size,
            objectId,
        };
    }
    if (value instanceof Immutable.Record) {
        return {
            type: 'object',
            className: 'Record',
            subType: 'map',
            size: value.size,
            objectId,
        };
    }
    if (Immutable.Seq.isSeq(value)) {
        return {
            type: 'object',
            className: 'Seq',
            subType: 'iterable',
            size: value.size,
            objectId,
        };
    }
    return false;
}

registerObjectSerializer(immutableSerializer);

const serializeIm = (value) => serialize(value, immutableSerializer);

test('should serialize list', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    t.deepEqual(serializeIm([]), {
        className: 'Array',
        objectId: 'test',
        type: 'object',
        subType: 'list',
        size: 0,
    });
    t.deepEqual(serializeIm([1, 2, 3]), {
        className: 'Array',
        objectId: 'test',
        type: 'object',
        subType: 'list',
        size: 3,
    });
    t.deepEqual(serializeIm(Immutable.List([])), {
        className: 'List',
        objectId: 'test',
        type: 'object',
        subType: 'list',
        size: 0,
    });
    t.deepEqual(serializeIm(Immutable.List([1, 2, 3])), {
        className: 'List',
        objectId: 'test',
        type: 'object',
        subType: 'list',
        size: 3,
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize map', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    t.deepEqual(serializeIm(new Map()), {
        className: 'Map',
        objectId: 'test',
        type: 'object',
        subType: 'map',
        size: 0,
    });
    t.deepEqual(serializeIm(new Map([[1, 'one'], [2, 'two'], [3, 'three']])), {
        className: 'Map',
        objectId: 'test',
        type: 'object',
        subType: 'map',
        size: 3,
    });
    t.deepEqual(serializeIm(new Immutable.Map()), {
        className: 'Map',
        objectId: 'test',
        type: 'object',
        subType: 'map',
        size: 0,
    });
    t.deepEqual(serializeIm(new Immutable.Map([[1, 'one'], [2, 'two'], [3, 'three']])), {
        className: 'Map',
        objectId: 'test',
        type: 'object',
        subType: 'map',
        size: 3,
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize set', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    t.deepEqual(serializeIm(new Set()), {
        objectId: 'test',
        type: 'object',
        className: 'Set',
        subType: 'set',
        size: 0,
    });
    t.deepEqual(serializeIm(new Immutable.Set([1, 1, 2, 3])), {
        objectId: 'test',
        type: 'object',
        className: 'Set',
        subType: 'set',
        size: 3,
    });
    t.deepEqual(serializeIm(new Immutable.Set()), {
        objectId: 'test',
        type: 'object',
        className: 'Set',
        subType: 'set',
        size: 0,
    });
    t.deepEqual(serializeIm(new Set([1, 1, 2, 3])), {
        objectId: 'test',
        type: 'object',
        className: 'Set',
        subType: 'set',
        size: 3,
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize record', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    const R = Immutable.Record({ a: null, b: null, c: null });
    t.deepEqual(serializeIm(new R()), {
        objectId: 'test',
        type: 'object',
        className: 'Record',
        subType: 'map',
        size: 3,
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize seq', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    t.deepEqual(serializeIm(Immutable.Seq()), {
        objectId: 'test',
        type: 'object',
        className: 'Seq',
        subType: 'iterable',
        size: 0,
    });
    t.deepEqual(serializeIm(Immutable.Repeat()), {
        objectId: 'test',
        type: 'object',
        className: 'Seq',
        subType: 'iterable',
        size: 'Infinity',
    });
    t.deepEqual(serializeIm(Immutable.Range()), {
        objectId: 'test',
        type: 'object',
        className: 'Seq',
        subType: 'iterable',
        size: 'Infinity',
    });
    t.deepEqual(serializeIm(Immutable.Repeat(0, 5)), {
        objectId: 'test',
        type: 'object',
        className: 'Seq',
        subType: 'iterable',
        size: 5,
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});
