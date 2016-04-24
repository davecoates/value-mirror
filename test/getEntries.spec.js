import serialize from '../src/serialize';
import getEntries from '../src/getEntries';
import expect from 'expect';

describe('Get entries', () => {
    it('should get entries from array', () => {
        const items = Array.from({ length: 5 }, (v, k) => k);
        const serialized = serialize(items);
        expect(getEntries(serialized.objectId)).toEqual({
            result: items,
            done: true,
        });
    });

    it('should get entries from array (partial)', () => {
        const items = Array.from({ length: 10 }, (v, k) => k);
        const serialized = serialize(items);
        const entries = getEntries(serialized.objectId, null, { limit: 5 });
        expect(entries).toEqual({
            result: [0, 1, 2, 3, 4],
            done: false,
            iteratorId: 0,
        });
        expect(getEntries(serialized.objectId, entries.iteratorId, { limit: 5 })).toEqual({
            result: [5, 6, 7, 8, 9],
            done: true,
        });
    });
});
