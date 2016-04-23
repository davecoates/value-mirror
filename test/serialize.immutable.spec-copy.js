import serialize, { __RewireAPI__ as serializeRewireAPI } from '../src';
import expect from 'expect';
import Immutable from 'immutable';

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
}

const serializeIm = (value) => serialize(value, immutableSerializer);

describe('Serialize (immutable)', () => {
    it('should serialize list', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serializeIm([])).toEqual({
            className: 'Array',
            objectId: 'test',
            type: 'object',
            subType: 'list',
            size: 0,
        });
        expect(serializeIm([1, 2, 3])).toEqual({
            className: 'Array',
            objectId: 'test',
            type: 'object',
            subType: 'list',
            size: 3,
        });
        expect(serializeIm(Immutable.List([]))).toEqual({
            className: 'List',
            objectId: 'test',
            type: 'object',
            subType: 'list',
            size: 0,
        });
        expect(serializeIm(Immutable.List([1, 2, 3]))).toEqual({
            className: 'List',
            objectId: 'test',
            type: 'object',
            subType: 'list',
            size: 3,
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize map', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serializeIm(new Map())).toEqual({
            className: 'Map',
            objectId: 'test',
            type: 'object',
            subType: 'map',
            size: 0,
        });
        expect(serializeIm(new Map([[1, 'one'], [2, 'two'], [3, 'three']]))).toEqual({
            className: 'Map',
            objectId: 'test',
            type: 'object',
            subType: 'map',
            size: 3,
        });
        expect(serializeIm(new Immutable.Map())).toEqual({
            className: 'Map',
            objectId: 'test',
            type: 'object',
            subType: 'map',
            size: 0,
        });
        expect(serializeIm(new Immutable.Map([[1, 'one'], [2, 'two'], [3, 'three']]))).toEqual({
            className: 'Map',
            objectId: 'test',
            type: 'object',
            subType: 'map',
            size: 3,
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize set', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serializeIm(new Set())).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Set',
            subType: 'set',
            size: 0,
        });
        expect(serializeIm(new Immutable.Set([1, 1, 2, 3]))).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Set',
            subType: 'set',
            size: 3,
        });
        expect(serializeIm(new Immutable.Set())).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Set',
            subType: 'set',
            size: 0,
        });
        expect(serializeIm(new Set([1, 1, 2, 3]))).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Set',
            subType: 'set',
            size: 3,
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize record', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        const R = Immutable.Record({ a: null, b: null, c: null });
        expect(serializeIm(new R())).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Record',
            subType: 'map',
            size: 3,
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize seq', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serializeIm(Immutable.Seq())).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Seq',
            subType: 'iterable',
            size: 0,
        });
        expect(serializeIm(Immutable.Repeat())).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Seq',
            subType: 'iterable',
            size: Infinity,
        });
        expect(serializeIm(Immutable.Range())).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Seq',
            subType: 'iterable',
            size: Infinity,
        });
        expect(serializeIm(Immutable.Repeat(0, 5))).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Seq',
            subType: 'iterable',
            size: 5,
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });
});
