import serialize, { __RewireAPI__ as serializeRewireAPI } from '../src';
import expect from 'expect';

describe('Serialize (objects)', () => {
    it('should serialize null', () => {
        expect(serialize(null)).toEqual({
            type: 'object',
            subType: 'null',
        });
    });

    it('should serialize plain object', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serialize({})).toEqual({
            objectId: 'test',
            type: 'object',
        });
        expect(serialize({ test: 123 })).toEqual({
            objectId: 'test',
            type: 'object',
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize array', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serialize([])).toEqual({
            objectId: 'test',
            type: 'object',
            subType: 'array',
            size: 0,
        });
        expect(serialize([1, 2, 3])).toEqual({
            objectId: 'test',
            type: 'object',
            subType: 'array',
            size: 3,
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });
});
