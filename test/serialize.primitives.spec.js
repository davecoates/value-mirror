import serialize from '../src/serialize';
import expect from 'expect';

describe('Serialize (primitives)', () => {
    it('should handle numbers', () => {
        expect((serialize(1))).toEqual({
            type: 'number',
            value: 1,
        });
        expect((serialize(-23))).toEqual({
            type: 'number',
            value: -23,
        });
        expect((serialize(NaN))).toEqual({
            type: 'number',
            value: 'NaN',
        });
        expect((serialize(Infinity))).toEqual({
            type: 'number',
            value: 'Infinity',
        });
        expect((serialize(-Infinity))).toEqual({
            type: 'number',
            value: '-Infinity',
        });
        expect((serialize(-0))).toEqual({
            type: 'number',
            value: '-0',
        });
    });
    it('should handle strings', () => {
        expect((serialize(''))).toEqual({
            type: 'string',
            value: '',
        });
        expect((serialize("i'm a string"))).toEqual({
            type: 'string',
            value: "i'm a string",
        });
    });
    it('should handle booleans', () => {
        expect((serialize(true))).toEqual({
            type: 'boolean',
            value: true,
        });
        expect((serialize(false))).toEqual({
            type: 'boolean',
            value: false,
        });
    });
    it('should handle undefined', () => {
        expect((serialize(undefined))).toEqual({
            type: 'undefined',
        });
    });
    it('should handle symbols', () => {
        expect((serialize(Symbol.iterator))).toEqual({
            type: 'symbol',
            value: 'Symbol(Symbol.iterator)',
        });
        expect((serialize(Symbol('test')))).toEqual({
            type: 'symbol',
            value: 'Symbol(test)',
        });
    });
});
