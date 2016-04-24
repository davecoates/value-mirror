import serialize from '../src/serialize';
import getEntries from '../src/getEntries';
import mirror, { $mirrorEntriesFetched } from '../src/mirror';
import expect from 'expect';

function takeAll(iterator) {
    const values = [];
    for (const item of iterator) {
        values.push(item);
    }
    return values;
}

describe('Mirror primitives', () => {
    it('should handle numbers', () => {
        for (const n of [-10, 0, 1, -0, Infinity, -Infinity]) {
            expect(mirror(serialize(n))).toEqual(n);
        }
    });
    it('should handle strings', () => {
        for (const n of ['', 'abc', '     def']) {
            expect(mirror(serialize(n))).toEqual(n);
        }
    });
    it('should handle booleans', () => {
        expect(mirror(serialize(true))).toEqual(true);
        expect(mirror(serialize(false))).toEqual(false);
    });
    it('should handle undefined', () => {
        expect(mirror(serialize(undefined))).toEqual(undefined);
    });
    it('should handle symbols', () => {
        // TODO: No idea what I should be doing here
    });
});

describe('Mirror objects', () => {
    it('should serialize null', () => {
        expect(mirror(serialize(null))).toEqual(null);
    });

    it('should serialize plain object', () => {
        expect(mirror(serialize({}))).toEqual({});
        expect(mirror(serialize({ test: 123 }))).toEqual({});
    });

    it('should serialize list', () => {
        const emptyArray = mirror(serialize([]));
        expect(emptyArray).toEqual([]);
    });

    it('should serialize map', () => {
        const entries = [[1, 'one'], [2, 'two'], [3, 'three']];
        const serialized = serialize(new Map(entries));
        const items = mirror(serialized);
        expect(takeAll(items.entries())).toEqual([]);
        items[$mirrorEntriesFetched](getEntries(serialized.objectId));
        expect(takeAll(items.entries())).toEqual(entries);
    });

    it('should serialize set', () => {});

    it('should serialize date', () => {});

    it('should serialize regexp', () => {});

    it('should serialize iterator', () => {});
});
