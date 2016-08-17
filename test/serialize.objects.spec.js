import serialize, { __RewireAPI__ as serializeRewireAPI } from '../src/serialize';
import test from 'ava';

test('should serialize null', t => {
    t.deepEqual(serialize(null), {
        type: 'null',
    });
});

test('should serialize plain object', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    t.deepEqual(serialize({}), {
        objectId: 'test',
        type: 'object',
        subType: null,
    });
    t.deepEqual(serialize({ test: 123 }), {
        objectId: 'test',
        type: 'object',
        subType: null,
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize list', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    t.deepEqual(serialize([]), {
        className: 'Array',
        objectId: 'test',
        type: 'object',
        subType: 'list',
        size: 0,
    });
    t.deepEqual(serialize([1, 2, 3]), {
        className: 'Array',
        objectId: 'test',
        type: 'object',
        subType: 'list',
        size: 3,
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize map', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    t.deepEqual(serialize(new Map()), {
        className: 'Map',
        objectId: 'test',
        type: 'object',
        subType: 'map',
        size: 0,
    });
    t.deepEqual(serialize(new Map([[1, 'one'], [2, 'two'], [3, 'three']])), {
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
    t.deepEqual(serialize(new Set()), {
        objectId: 'test',
        type: 'object',
        className: 'Set',
        subType: 'set',
        size: 0,
    });
    t.deepEqual(serialize(new Set([1, 1, 2, 3])), {
        objectId: 'test',
        type: 'object',
        className: 'Set',
        subType: 'set',
        size: 3,
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize date', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    const d = new Date();
    t.deepEqual(serialize(d), {
        objectId: 'test',
        className: 'Date',
        type: 'object',
        subType: 'date',
        value: d.getTime(),
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize regexp', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    t.deepEqual(serialize(new RegExp(/ab+c/)), {
        objectId: 'test',
        className: 'RegExp',
        type: 'object',
        subType: 'regexp',
        value: {
            source: 'ab+c',
            flags: [],
        },
    });
    t.deepEqual(serialize(new RegExp('ab+c', 'i')), {
        objectId: 'test',
        className: 'RegExp',
        type: 'object',
        subType: 'regexp',
        value: {
            source: 'ab+c',
            flags: ['i'],
        },
    });
    t.deepEqual(serialize(/ab+c/i), {
        objectId: 'test',
        className: 'RegExp',
        type: 'object',
        subType: 'regexp',
        value: {
            source: 'ab+c',
            flags: ['i'],
        },
    });
    t.deepEqual(serialize(/ab+c/gi), {
        objectId: 'test',
        className: 'RegExp',
        type: 'object',
        subType: 'regexp',
        value: {
            source: 'ab+c',
            flags: ['g', 'i'],
        },
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});

test('should serialize iterator (generator)', t => {
    serializeRewireAPI.__Rewire__('acquireObjectId', () => 'test');
    function* gen() {
        yield 1;
        yield 2;
        yield 3;
    }
    t.deepEqual(serialize(gen()), {
        objectId: 'test',
        type: 'object',
        subType: 'iterable',
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});


test('should serialize iterator', t => {
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
    t.deepEqual(serialize(someString), {
        objectId: 'test',
        type: 'object',
        subType: 'iterable',
    });
    serializeRewireAPI.__ResetDependency__('acquireObjectId');
});
