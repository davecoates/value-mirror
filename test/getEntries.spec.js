import serialize from '../src/serialize';
import getEntries from '../src/getEntries';
import expect from 'expect';

describe('Get entries', () => {
    return;
    it('should get entries from array', () => {
        const items = Array.from({ length: 5 }, (v, k) => k);
        const serialized = serialize(items);
        const { objectId } = serialized;
        const entries = getEntries(objectId);
        expect(entries).toEqual({
            objectId,
            isNewIterator: true,
            result: items.map(v => ({type: 'number', value: v})),
            done: true,
        });
    });

    it('should get entries from array (partial)', () => {
        const items = Array.from({ length: 10 }, (v, k) => k);
        const serialized = serialize(items);
        const { objectId } = serialized;
        const entries = getEntries(objectId, null, { limit: 5 });
        expect(entries).toEqual({
            isNewIterator: true,
            objectId,
            result: [0, 1, 2, 3, 4].map(v => ({type: 'number', value: v})),
            done: false,
            iteratorId: 0,
        });
        expect(getEntries(objectId, entries.iteratorId, { limit: 5 })).toEqual({
            isNewIterator: false,
            objectId,
            result: [5, 6, 7, 8, 9].map(v => ({type: 'number', value: v})),
            done: true,
        });
    });

    it('should get entries from map (partial)', () => {
        return;
        const items = new Map(Array.from({ length: 4 }, (v, k) => [k, k.toString()]));
        const serialized = serialize(items);
        const { objectId } = serialized;
        const entries = getEntries(objectId, null, { limit: 2 });
        expect(entries).toEqual({
            isNewIterator: true,
            objectId,
            result: [[0, '0'], [1, '1']],
            done: false,
            iteratorId: 0,
        });
        expect(getEntries(objectId, entries.iteratorId, { limit: 2 })).toEqual({
            isNewIterator: false,
            objectId,
            result: [[2, '2'], [3, '3']],
            done: true,
        });
    });

    it('should get entries from infinite generator', () => {
        const items = (function *gen() {
            let i = 1;
            while(1) { // eslint-disable-line
                yield i++;
            }
        })();
        const serialized = serialize(items);
        const { objectId } = serialized;
        const entries = getEntries(objectId, null, { limit: 2 });
        expect(entries).toEqual({
            objectId,
            isNewIterator: true,
            result: [{type: 'number', value: 1}, {type: 'number', value: 2}],
            done: false,
            iteratorId: 0,
        });
        expect(getEntries(objectId, entries.iteratorId, { limit: 2 })).toEqual({
            objectId,
            isNewIterator: false,
            result: [{type: 'number', value: 3}, {type: 'number', value: 4}],
            done: false,
            iteratorId: 0,
        });
        expect(getEntries(objectId, entries.iteratorId, { limit: 200 })).toEqual({
            objectId,
            isNewIterator: false,
            result: Array.from({ length: 200 }, (v, k) => ({type: 'number', value: k + 5})),
            done: false,
            iteratorId: 0,
        });

        expect(() => getEntries(serialized.objectId, entries.iteratorId)).toThrow();
    });
});
