import ValueMirror from '../src/ValueMirror';
import expect from 'expect';

describe('Value Mirror (primitives)', () => {
    it('should handle numbers', () => {
        expect((new ValueMirror(1)).serialize()).toEqual({
            type: 'number',
            value: 1,
        });
        expect((new ValueMirror(-23)).serialize()).toEqual({
            type: 'number',
            value: -23,
        });
        expect((new ValueMirror(NaN)).serialize()).toEqual({
            type: 'number',
            value: 'NaN',
        });
        expect((new ValueMirror(Infinity)).serialize()).toEqual({
            type: 'number',
            value: 'Infinity',
        });
        expect((new ValueMirror(-Infinity)).serialize()).toEqual({
            type: 'number',
            value: '-Infinity',
        });
        expect((new ValueMirror(-0)).serialize()).toEqual({
            type: 'number',
            value: '-0',
        });
    });
    it('should handle strings', () => {
        expect((new ValueMirror('')).serialize()).toEqual({
            type: 'string',
            value: '',
        });
        expect((new ValueMirror("i'm a string")).serialize()).toEqual({
            type: 'string',
            value: "i'm a string",
        });
    });
    it('should handle booleans', () => {
        expect((new ValueMirror(true)).serialize()).toEqual({
            type: 'boolean',
            value: true,
        });
        expect((new ValueMirror(false)).serialize()).toEqual({
            type: 'boolean',
            value: false,
        });
    });
    it('should handle undefined', () => {
        expect((new ValueMirror(undefined)).serialize()).toEqual({
            type: 'undefined',
        });
    });
    it('should handle symbols', () => {
        expect((new ValueMirror(Symbol.iterator)).serialize()).toEqual({
            type: 'symbol',
            value: 'Symbol(Symbol.iterator)',
        });
        expect((new ValueMirror(Symbol('test'))).serialize()).toEqual({
            type: 'symbol',
            value: 'Symbol(test)',
        });
    });
});
