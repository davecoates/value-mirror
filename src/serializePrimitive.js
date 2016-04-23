// @flow
import type {
    UnserializableNumber,
    NumberDescription,
    StringDescription,
    UndefinedDescription,
    BooleanDescription,
    SymbolDescription,
} from './types';

export function serializeNumber(value: number) : NumberDescription {
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

export function serializeUndefined() : UndefinedDescription {
    return {
        type: 'undefined',
    };
}

export function serializeString(value: string) : StringDescription {
    return {
        type: 'string',
        value,
    };
}

export function serializeBoolean(value: boolean) : BooleanDescription {
    return {
        type: 'boolean',
        value,
    };
}

export function serializeSymbol(value: Symbol) : SymbolDescription {
    return {
        type: 'symbol',
        value: value.toString(),
    };
}
