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

    it('should get entries from map (partial)', () => {
        const items = new Map(Array.from({ length: 4 }, (v, k) => [k, k.toString()]));
        const serialized = serialize(items);
        const entries = getEntries(serialized.objectId, null, { limit: 2 });
        expect(entries).toEqual({
            result: [[0, '0'], [1, '1']],
            done: false,
            iteratorId: 0,
        });
        expect(getEntries(serialized.objectId, entries.iteratorId, { limit: 2 })).toEqual({
            result: [[2, '2'], [3, '3']],
            done: true,
        });
    });

    it('should get entries from infinite generator', () => {
        const items = (function *gen() {
            let i = 0;
            while(1) { // eslint-disable-line
                yield i++;
            }
        })();
        const serialized = serialize(items);
        const entries = getEntries(serialized.objectId, null, { limit: 2 });
        expect(entries).toEqual({
            result: [0, 1],
            done: false,
            iteratorId: 0,
        });
        expect(getEntries(serialized.objectId, entries.iteratorId, { limit: 2 })).toEqual({
            result: [2, 3],
            done: false,
            iteratorId: 0,
        });
        expect(getEntries(serialized.objectId, entries.iteratorId, { limit: 200 })).toEqual({
            result: Array.from({ length: 200 }, (v, k) => k + 4),
            done: false,
            iteratorId: 0,
        });

        expect(() => getEntries(serialized.objectId, entries.iteratorId)).toThrow();
    });
});
