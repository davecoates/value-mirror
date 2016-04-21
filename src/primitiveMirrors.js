// @flow
import type {
    UnserializableNumber,
    NumberMirror,
    StringMirror,
    UndefinedMirror,
    BooleanMirror,
    SymbolMirror,
} from './types';

export function numberMirror(value: number) : NumberMirror {
    let representation:number|UnserializableNumber = value;

    if (isNaN(value)) {
        representation = 'NaN';
    } else if (Infinity === value) {
        representation = 'Infinity';
    } else if (-Infinity === value) {
        representation = '-Infinity';
    } else if (value === -0) {
        representation = '-0';
    }

    return {
        type: 'number',
        value: representation,
    };
}

export function undefinedMirror() : UndefinedMirror {
    return {
        type: 'undefined',
    };
}

export function stringMirror(value: string) : StringMirror {
    return {
        type: 'string',
        value,
    };
}

export function booleanMirror(value: boolean) : BooleanMirror {
    return {
        type: 'boolean',
        value,
    };
}

export function symbolMirror(value: Symbol) : SymbolMirror {
    return {
        type: 'symbol',
        value: value.toString(),
    };
}
