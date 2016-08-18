import serialize from '../src/serialize';
import getEntries from '../src/getEntries';
import getProperties from '../src/getProperties';
import buildMirror, { ObjectMirror } from '../src/mirror';
import test from 'ava';

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

const client = new DefaultClient();

test('should handle numbers', t => {
    for (const n of [-10, 0, 1, -0, Infinity, -Infinity]) {
        t.is(buildMirror(serialize(n), client), n);
    }
});
test('should handle strings', t => {
    for (const n of ['', 'abc', '     def']) {
        t.is(buildMirror(serialize(n), client), n);
    }
});
test('should handle booleans', t => {
    t.is(buildMirror(serialize(true), client), true);
    t.is(buildMirror(serialize(false), client), false);
});
test('should handle undefined', t => {
    t.is(buildMirror(serialize(undefined), client), undefined);
});
test('should handle symbols', t => {
    const mirror = buildMirror(serialize(Symbol.for('test')), client);
    t.is(mirror.type, 'symbol');
});

test('should serialize null', t => {
    t.is(buildMirror(serialize(null), client), null);
});

test('should serialize plain object', async (t) => {
    let mirror = buildMirror(serialize({}), client);
    t.is(mirror.type, 'object');
    t.falsy(mirror.subType);
    t.falsy(mirror.properties);
    await mirror.getProperties();
    t.deepEqual(mirror.properties, []);

    mirror = buildMirror(serialize({ test: 123 }), client);
    t.is(mirror.type, 'object');
    t.falsy(mirror.subType);
    t.falsy(mirror.properties);
    await mirror.getProperties();
    t.deepEqual(mirror.properties, [{ key: 'test', value: 123, isRecursive: false }]);
});

test('should serialize plain object with recursive references', async (t) => {
    const data = { test: 123 };
    data.myself = data;
    const mirror = buildMirror(serialize(data), client);
    t.is(mirror.type, 'object');
    t.falsy(mirror.subType);
    t.falsy(mirror.properties);
    await mirror.getProperties();
    t.truthy(mirror.properties);
    t.is(mirror.properties.length, 2);
    t.deepEqual(mirror.properties[0], { key: 'test', value: 123, isRecursive: false });
    t.is(mirror.properties[1].key, 'myself');
    t.true(mirror.properties[1].isRecursive);
    t.true(mirror.properties[1].value instanceof ObjectMirror);
});

test('should mirror a list', async (t) => {
    const emptyArray = buildMirror(serialize([]), client);
    t.is(emptyArray.type, 'object');
    t.is(emptyArray.subType, 'list');
    t.is(emptyArray.fetchedCount(), 0);
    t.is(emptyArray.size, 0);
    t.true(emptyArray.allEntriesFetched);
    const value = [1, 2, 3, 4, 5];
    const mirror = buildMirror(serialize(value), client);
    t.is(mirror.type, 'object');
    t.is(mirror.subType, 'list');
    t.is(mirror.fetchedCount(), 0);
    t.is(mirror.size, 5);
    t.false(mirror.allEntriesFetched);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.fetchedCount(), 2);
    t.is(mirror.size, 5);
    t.false(mirror.allEntriesFetched);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.fetchedCount(), 4);
    t.is(mirror.size, 5);
    t.false(mirror.allEntriesFetched);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.fetchedCount(), 5);
    t.is(mirror.size, 5);
    t.true(mirror.allEntriesFetched);
    t.deepEqual(mirror.value, value);
});

test('should serialize map', async (t) => {
    const entries = [[1, 'one'], [2, 'two'], [3, 'three']];
    const serialized = serialize(new Map(entries));
    const mirror = buildMirror(serialized, client);
    t.is(mirror.type, 'object');
    t.is(mirror.subType, 'map');
    t.is(mirror.size, 3);
    t.false(mirror.allEntriesFetched);
    t.is(mirror.fetchedCount(), 0);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.size, 3);
    t.is(mirror.fetchedCount(), 2);
    t.false(mirror.allEntriesFetched);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.size, 3);
    t.is(mirror.fetchedCount(), 3);
    t.true(mirror.allEntriesFetched);
    t.deepEqual([...mirror.value.entries()], entries);
});

test('should serialize set', async (t) => {
    const entries = [1, 2, 3, 4, 5];
    const serialized = serialize(new Set(entries));
    const mirror = buildMirror(serialized, client);
    t.is(mirror.type, 'object');
    t.is(mirror.subType, 'set');
    t.is(mirror.size, 5);
    t.false(mirror.allEntriesFetched);
    t.is(mirror.fetchedCount(), 0);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.size, 5);
    t.is(mirror.fetchedCount(), 2);
    t.false(mirror.allEntriesFetched);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.size, 5);
    t.is(mirror.fetchedCount(), 4);
    t.false(mirror.allEntriesFetched);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.size, 5);
    t.is(mirror.fetchedCount(), 5);
    t.true(mirror.allEntriesFetched);
    t.deepEqual([...mirror.value.values()], entries);
});

test('should serialize date', t => {
    const d = new Date();
    const mirror = buildMirror(serialize(d), client);
    t.is(mirror.type, 'object');
    t.is(mirror.subType, 'date');
    t.is(mirror.value, d.getTime());
});

test('should serialize regexp', t => {
    const r = new RegExp(/[a-z]*/, 'ig');
    const mirror = buildMirror(serialize(r), client);
    t.is(mirror.type, 'object');
    t.is(mirror.subType, 'regexp');
    t.deepEqual([...mirror.flags].sort(), ['g', 'i']);
});

test('should serialize iterator', async (t) => {
    function* gen() {
        yield 1;
        yield 2;
        yield 3;
    }
    const mirror = buildMirror(serialize(gen()), client);
    t.is(mirror.type, 'object');
    t.is(mirror.subType, 'iterable');
    t.falsy(mirror.size);
    t.false(mirror.allEntriesFetched);
    t.throws(() => mirror.getEntries());
    await mirror.getEntries({ limit: 2 });
    t.falsy(mirror.size);
    t.false(mirror.allEntriesFetched);
    t.deepEqual(mirror.value, [1, 2]);
    await mirror.getEntries({ limit: 2 });
    t.is(mirror.size, 3);
    t.true(mirror.allEntriesFetched);
    t.deepEqual(mirror.value, [1, 2, 3]);
});
