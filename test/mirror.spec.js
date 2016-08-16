import serialize from '../src/serialize';
import getEntries from '../src/getEntries';
import mirror from '../src/mirror';
import expect from 'expect';

class DefaultClient {

    getEntries(objectId, iteratorId, config) {
        const entries = getEntries(
            objectId,
            iteratorId,
            config
        );
        return Promise.resolve(entries);
    }

    getProperties(objectId) {
        const properties = getProperties(objectId);
        return Promise.resolve(properties);
    }

}

function takeAll(iterator) {
    const values = [];
    for (const item of iterator) {
        values.push(item);
    }
    return values;
}

const client = new DefaultClient();

describe('Mirror primitives', () => {
    it('should handle numbers', () => {
        for (const n of [-10, 0, 1, -0, Infinity, -Infinity]) {
            expect(mirror(serialize(n), client)).toEqual(n);
        }
    });
    it('should handle strings', () => {
        for (const n of ['', 'abc', '     def']) {
            expect(mirror(serialize(n), client)).toEqual(n);
        }
    });
    it('should handle booleans', () => {
        expect(mirror(serialize(true), client)).toEqual(true);
        expect(mirror(serialize(false), client)).toEqual(false);
    });
    it('should handle undefined', () => {
        expect(mirror(serialize(undefined), client)).toEqual(undefined);
    });
    it('should handle symbols', () => {
        // TODO: No idea what I should be doing here
    });
});

describe('Mirror objects', () => {
    it('should serialize null', () => {
        // expect(mirror(serialize(null), client)).toEqual(null);
    });

    it('should serialize plain object', () => {
        // expect(mirror(serialize({}), client)).toEqual({});
        // expect(mirror(serialize({ test: 123 }), client)).toEqual({});
    });

    it('should serialize list', () => {
        const emptyArray = mirror(serialize([], client));
        // expect(emptyArray).toEqual([]);
    });

    it('should serialize map', (done) => {
        const entries = [[1, 'one'], [2, 'two'], [3, 'three']];
        const serialized = serialize(new Map(entries));
        const items = mirror(serialized, client);
        expect(items.allEntriesFetched).toEqual(false);
        expect(items.fetchedCount()).toEqual(0);
        items.getEntries().then(() => {
            expect(items.fetchedCount()).toEqual(3);
            expect(items.allEntriesFetched).toEqual(true);
            done();
        }).catch(error => done(error));
    });

    it('should serialize set', () => {});

    it('should serialize date', () => {});

    it('should serialize regexp', () => {});

    it('should serialize iterator', () => {});
});
