import serialize from '../src/serialize';
import getEntries from '../src/getEntries';
import test from 'ava';

test('should get entries from array', t => {
    const items = Array.from({ length: 5 }, (v, k) => k + 1);
    const serialized = serialize(items);
    const { objectId } = serialized;
    const entries = getEntries(objectId);
    t.deepEqual(entries, {
        objectId,
        isNewIterator: true,
        result: items.map(v => ({ type: 'number', value: v })),
        done: true,
    });
});
test('should get entries from array (partial)', t => {
    const items = Array.from({ length: 10 }, (v, k) => k + 1);
    const serialized = serialize(items);
    const { objectId } = serialized;
    const entries = getEntries(objectId, null, { limit: 5 });
    t.deepEqual(entries, {
        isNewIterator: true,
        objectId,
        result: [1, 2, 3, 4, 5].map(v => ({ type: 'number', value: v })),
        done: false,
        iteratorId: 0,
    });
    t.deepEqual(getEntries(objectId, entries.iteratorId, { limit: 5 }), {
        isNewIterator: false,
        objectId,
        result: [6, 7, 8, 9, 10].map(v => ({ type: 'number', value: v })),
        done: true,
    });
});

test('should get entries from map (partial)', t => {
    const items = new Map(Array.from({ length: 4 }, (v, k) => [k + 1, (k + 1).toString()]));
    const serialized = serialize(items);
    const { objectId } = serialized;
    const entries = getEntries(objectId, null, { limit: 2 });
    t.deepEqual(entries, {
        isNewIterator: true,
        objectId,
        result: [1, 2].map(v => ([
            { type: 'number', value: v },
            { type: 'string', value: v.toString() },
        ])),
        done: false,
        iteratorId: 0,
    });
    t.deepEqual(getEntries(objectId, entries.iteratorId, { limit: 2 }), {
        isNewIterator: false,
        objectId,
        result: [3, 4].map(v => ([
            { type: 'number', value: v },
            { type: 'string', value: v.toString() },
        ])),
        done: true,
    });
});

test('should get entries from infinite generator', t => {
    const items = (function *gen() {
        let i = 1;
        while(1) { // eslint-disable-line
            yield i++;
        }
    }());
    const serialized = serialize(items);
    const { objectId } = serialized;
    const entries = getEntries(objectId, null, { limit: 2 });
    t.deepEqual(entries, {
        objectId,
        isNewIterator: true,
        result: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }],
        done: false,
        iteratorId: 0,
    });
    t.deepEqual(getEntries(objectId, entries.iteratorId, { limit: 2 }), {
        objectId,
        isNewIterator: false,
        result: [{ type: 'number', value: 3 }, { type: 'number', value: 4 }],
        done: false,
        iteratorId: 0,
    });
    t.deepEqual(getEntries(objectId, entries.iteratorId, { limit: 200 }), {
        objectId,
        isNewIterator: false,
        result: Array.from({ length: 200 }, (v, k) => ({ type: 'number', value: k + 5 })),
        done: false,
        iteratorId: 0,
    });

    t.throws(() => getEntries(serialized.objectId, entries.iteratorId));
});
