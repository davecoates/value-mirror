/* eslint-disable no-use-before-define */
import serialize from '../src/serialize';
import getEntries from '../src/getEntries';
import getProperties from '../src/getProperties';
import buildMirror, {
    ObjectMirror, ListMirror, SetMirror, CollectionMirror, MapMirror,
} from '../src/mirror';
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

function objectMirrorEquals(mirror1, mirror2) {
    if (mirror1.type !== mirror2.type ||
        mirror1.subType !== mirror2.subType ||
        (mirror1.properties || []).length !== (mirror2.properties || []).length) {
        return false;
    }
    if (!mirror1.properties) {
        return true;
    }
    for (let i = 0; i < mirror1.properties.length; i++) {
        const prop1 = mirror1.properties[i];
        const prop2 = mirror2.properties[i];
        if (prop1.key !== prop2.key) {
            return false;
        }
        if (prop1.value instanceof ObjectMirror) {
            if (!mirrorEquals(prop1.value, prop2.value)) {
                return false;
            }
        } else if (prop1.value !== prop2.value) {
            return false;
        }
    }
    return true;
}

function collectionMirrorEquals(mirror1, mirror2) {
    if (mirror1.type !== mirror2.type ||
        mirror1.subType !== mirror2.subType ||
        mirror1.fetchedCount() !== mirror2.fetchedCount()) {
        return false;
    }
    if (mirror1 instanceof ListMirror) {
        for (let i = 0; i < mirror1.value.length; i++) {
            if (mirror1.value[i] instanceof ObjectMirror) {
                if (!mirrorEquals(mirror1.value[i], mirror2.value[i])) {
                    return false;
                }
            } else if (mirror1.value[i] !== mirror2.value[i]) {
                return false;
            }
        }
    } else if (mirror1 instanceof SetMirror) {
        const values1 = [...mirror1.value.values()];
        const values2 = [...mirror2.value.values()];
        for (let i = 0; i < values1.length; i++) {
            if (values1[i] instanceof ObjectMirror) {
                if (!mirrorEquals(values1[i], values2[i])) {
                    return false;
                }
            } else if (values1[i] !== values2[i]) {
                return false;
            }
        }
    } else if (mirror1 instanceof MapMirror) {
        const values1 = [...mirror1.value.values()];
        const values2 = [...mirror2.value.values()];
        for (let i = 0; i < values1.length; i++) {
            if (values1[i] instanceof ObjectMirror) {
                if (!mirrorEquals(values1[i], values2[i])) {
                    return false;
                }
            } else if (values1[i] !== values2[i]) {
                return false;
            }
        }
    } else {
        throw Error('Expected exhaustic checks for all types');
    }
    return true;
}

function mirrorEquals(mirror1, mirror2) {
    if (mirror1 instanceof CollectionMirror) {
        return collectionMirrorEquals(mirror1, mirror2);
    }
    if (mirror1 instanceof ObjectMirror) {
        return objectMirrorEquals(mirror1, mirror2);
    }
    return mirror1 === mirror2;
}


test('Sync object mirror', async (t) => {
    const data1 = serialize({ a: '1', b: '2', d: { e: '3' } });
    const data2 = serialize({ a: '1', b: '2', d: { e: '3' } });
    const mirror1 = new buildMirror(data1, client);
    const mirror2 = new buildMirror(data2, client);
    await mirror1.getProperties();
    await mirror2.synchronise(mirror1);
    t.true(objectMirrorEquals(mirror1, mirror2));
    await mirror1.properties[2].value.getProperties();
    await mirror2.synchronise(mirror1);
    t.true(objectMirrorEquals(mirror1, mirror2));
});

test('Sync list mirror (flat)', async (t) => {
    const values = [1, 2, 3, 4, 5];
    const data1 = serialize(values.slice());
    const data2 = serialize(values.slice());
    const mirror1 = new buildMirror(data1, client);
    const mirror2 = new buildMirror(data2, client);
    await mirror1.getEntries({ limit: 3 });
    t.deepEqual(mirror1.value, values.slice(0, 3));
    await mirror2.synchronise(mirror1);
    t.deepEqual(mirror1.value, mirror2.value);
    await mirror1.getEntries({ limit: 1 });
    t.deepEqual(mirror1.value, values.slice(0, 4));
    await mirror2.synchronise(mirror1);
    t.deepEqual(mirror1.value, mirror2.value);
});

test('Sync list mirror (nested)', async (t) => {
    const data1 = serialize([1, [2, [3, 4]], 5, 6, { a: 'ok' }]);
    const data2 = serialize([1, [2, [3, 4]], 5, 6, { a: 'ok' }]);
    const mirror1 = new buildMirror(data1, client);
    const mirror2 = new buildMirror(data2, client);
    await mirror1.getEntries({ limit: 3 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await mirror1.getEntries({ limit: 2 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // 1 level deep
    t.true(mirror1.value[1] instanceof ListMirror);
    await mirror1.value[1].getEntries({ limit: 1 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await mirror1.value[1].getEntries();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // 2 levels deep
    t.true(mirror1.value[1].value[1] instanceof ListMirror);
    await mirror1.value[1].value[1].getEntries({ limit: 1 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await mirror1.value[1].value[1].getEntries();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // Nested object
    await mirror1.value[4].getProperties();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
});

test('Sync set mirror (flat)', async (t) => {
    const values = [1, 2, 3, 4, 5];
    const data1 = serialize(new Set(values));
    const data2 = serialize(new Set(values));
    const mirror1 = new buildMirror(data1, client);
    const mirror2 = new buildMirror(data2, client);
    await mirror1.getEntries({ limit: 3 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await mirror1.getEntries({ limit: 1 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
});

test('Sync set mirror (nested)', async (t) => {
    const data1 = serialize(new Set([1, [2, [3, 4]], 5, 6, { a: 'ok' }]));
    const data2 = serialize(new Set([1, [2, [3, 4]], 5, 6, { a: 'ok' }]));
    const mirror1 = new buildMirror(data1, client);
    const mirror2 = new buildMirror(data2, client);
    await mirror1.getEntries({ limit: 3 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await mirror1.getEntries({ limit: 2 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // 1 level deep
    t.true([...mirror1.value][1] instanceof ListMirror);
    await [...mirror1.value][1].getEntries({ limit: 1 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await [...mirror1.value][1].getEntries();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // 2 levels deep
    t.true([...[...mirror1.value][1].value][1] instanceof ListMirror);
    await [...[...mirror1.value][1].value][1].getEntries({ limit: 1 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await [...[...mirror1.value][1].value][1].getEntries();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // Nested object
    await [...mirror1.value][4].getProperties();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
});

test('Sync map mirror (flat)', async (t) => {
    const data1 = serialize(
        new Map([[1, new Map([['a', 'A']])], [2, 'b'], [3, 'c'], [4, { 5: 'd' }]]));
    const data2 = serialize(
        new Map([[1, new Map([['a', 'A']])], [2, 'b'], [3, 'c'], [4, { 5: 'd' }]]));
    const mirror1 = new buildMirror(data1, client);
    const mirror2 = new buildMirror(data2, client);
    await mirror1.getEntries({ limit: 3 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await mirror1.getEntries({ limit: 1 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
});

test('Sync map mirror (nested)', async (t) => {
    const data1 = serialize(
        new Map([
            [1, new Map([['a', 'A'], ['b', [1, 2, 3]]])],
            [2, 'b'], [3, 'c'], [4, { 5: 'd' }]]));
    const data2 = serialize(
        new Map([
            [1, new Map([['a', 'A'], ['b', [1, 2, 3]]])],
            [2, 'b'], [3, 'c'], [4, { 5: 'd' }]]));
    const mirror1 = new buildMirror(data1, client);
    const mirror2 = new buildMirror(data2, client);
    await mirror1.getEntries({ limit: 3 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await mirror1.getEntries({ limit: 2 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // 1 level deep
    t.true(mirror1.value.get(1) instanceof MapMirror);
    await mirror1.value.get(1).getEntries({ limit: 1 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await await mirror1.value.get(1).getEntries();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // 2 levels deep
    t.true(mirror1.value.get(1).value.get('b') instanceof ListMirror);
    await mirror1.value.get(1).value.get('b').getEntries({ limit: 1 });
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    await mirror1.value.get(1).value.get('b').getEntries();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
    // Nested object
    await mirror1.value.get(4).getProperties();
    await mirror2.synchronise(mirror1);
    t.true(mirrorEquals(mirror1, mirror2));
});
