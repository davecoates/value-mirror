import serialize, { __RewireAPI__ as serializeRewireAPI } from '../src/serialize';
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

    it('should serialize list', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serialize([])).toEqual({
            className: 'Array',
            objectId: 'test',
            type: 'object',
            subType: 'list',
            size: 0,
        });
        expect(serialize([1, 2, 3])).toEqual({
            className: 'Array',
            objectId: 'test',
            type: 'object',
            subType: 'list',
            size: 3,
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize map', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serialize(new Map())).toEqual({
            className: 'Map',
            objectId: 'test',
            type: 'object',
            subType: 'map',
            size: 0,
        });
        expect(serialize(new Map([[1, 'one'], [2, 'two'], [3, 'three']]))).toEqual({
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
        expect(serialize(new Set())).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Set',
            subType: 'set',
            size: 0,
        });
        expect(serialize(new Set([1, 1, 2, 3]))).toEqual({
            objectId: 'test',
            type: 'object',
            className: 'Set',
            subType: 'set',
            size: 3,
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize date', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        const d = new Date();
        expect(serialize(d)).toEqual({
            objectId: 'test',
            className: 'Date',
            type: 'object',
            subType: 'date',
            value: d.getTime(),
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize regexp', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        expect(serialize(new RegExp(/ab+c/))).toEqual({
            objectId: 'test',
            className: 'RegExp',
            type: 'object',
            subType: 'regexp',
            value: {
                source: 'ab+c',
                flags: '',
            },
        });
        expect(serialize(new RegExp('ab+c', 'i'))).toEqual({
            objectId: 'test',
            className: 'RegExp',
            type: 'object',
            subType: 'regexp',
            value: {
                source: 'ab+c',
                flags: 'i',
            },
        });
        expect(serialize(/ab+c/i)).toEqual({
            objectId: 'test',
            className: 'RegExp',
            type: 'object',
            subType: 'regexp',
            value: {
                source: 'ab+c',
                flags: 'i',
            },
        });
        expect(serialize(/ab+c/gi)).toEqual({
            objectId: 'test',
            className: 'RegExp',
            type: 'object',
            subType: 'regexp',
            value: {
                source: 'ab+c',
                flags: 'gi',
            },
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });

    it('should serialize iterator (generator)', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        function* gen() {
            yield 1;
            yield 2;
            yield 3;
        }
        expect(serialize(gen())).toEqual({
            objectId: 'test',
            type: 'object',
            subType: 'iterable',
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });


    it('should serialize iterator', () => {
        serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
        /* eslint-disable */
        // From MDN
        const someString = new String("hi");
        someString[Symbol.iterator] = function() {
            return { // this is the iterator object, returning a single element, the string "bye"
                next: function() {
                    if (this._first) {
                        this._first = false;
                        return { value: "bye", done: false };
                    } else {
                        return { done: true };
                    }
                },
                _first: true
            };
        };
        /* eslint-enable */
        expect(serialize(someString)).toEqual({
            objectId: 'test',
            type: 'object',
            subType: 'iterable',
        });
        serializeRewireAPI.__ResetDependency__('acquireObjectId');
    });
});
