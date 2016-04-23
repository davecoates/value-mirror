// @flow
import type {
    UnserializableNumber,
    NumberDescriptor,
    StringDescriptor,
    UndefinedDescriptor,
    BooleanDescriptor,
    SymbolDescriptor,
} from './types';

export function serializeNumber(value: number) : NumberDescriptor {
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

export function serializeUndefined() : UndefinedDescriptor {
    return {
        type: 'undefined',
    };
}

export function serializeString(value: string) : StringDescriptor {
    return {
        type: 'string',
        value,
    };
}

export function serializeBoolean(value: boolean) : BooleanDescriptor {
    return {
        type: 'boolean',
        value,
    };
}

export function serializeSymbol(value: Symbol) : SymbolDescriptor {
    return {
        type: 'symbol',
        value: value.toString(),
    };
}
