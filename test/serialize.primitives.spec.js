import serialize from '../src/serialize';
import test from 'ava';

test('should handle numbers', t => {
    t.deepEqual((serialize(1)), {
        type: 'number',
        value: 1,
    });
    t.deepEqual((serialize(-23)), {
        type: 'number',
        value: -23,
    });
    t.deepEqual((serialize(NaN)), {
        type: 'number',
        value: 'NaN',
    });
    t.deepEqual((serialize(Infinity)), {
        type: 'number',
        value: 'Infinity',
    });
    t.deepEqual((serialize(-Infinity)), {
        type: 'number',
        value: '-Infinity',
    });
    t.deepEqual((serialize(-0)), {
        type: 'number',
        value: '-0',
    });
});
test('should handle strings', t => {
    t.deepEqual((serialize('')), {
        type: 'string',
        value: '',
    });
    t.deepEqual((serialize("i'm a string")), {
        type: 'string',
        value: "i'm a string",
    });
});
test('should handle booleans', t => {
    t.deepEqual((serialize(true)), {
        type: 'boolean',
        value: true,
    });
    t.deepEqual((serialize(false)), {
        type: 'boolean',
        value: false,
    });
});
test('should handle undefined', t => {
    t.deepEqual((serialize(undefined)), {
        type: 'undefined',
    });
});
test('should handle symbols', t => {
    t.deepEqual((serialize(Symbol.iterator)), {
        type: 'symbol',
        value: 'Symbol(Symbol.iterator)',
    });
    t.deepEqual((serialize(Symbol('test'))), {
        type: 'symbol',
        value: 'Symbol(test)',
    });
});
