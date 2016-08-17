// @flow
import type {
    UnserializableNumber,
    NumberDescriptor,
    StringDescriptor,
    UndefinedDescriptor,
    BooleanDescriptor,
    SymbolDescriptor,
} from './types';

export function serializableNumberRepresentation(
    value: number,
    convertNegativeZero:boolean = true
) : number|UnserializableNumber {
    if (isNaN(value)) {
        return 'NaN';
    } else if (Infinity === value) {
        return 'Infinity';
    } else if (-Infinity === value) {
        return '-Infinity';
    } else if (value === -0) {
        if (convertNegativeZero) {
            return 0;
        }
        return '-0';
    }

    return value;
}

export function unserializeNumber(value: number | string) : number {
    if (typeof(value) == 'number') {
        return value;
    }
    if (value === 'NaN') return NaN;
    if (value === 'Infinity') return Infinity;
    if (value === '-Infinity') return -Infinity;
    if (value === '-0') return -0;

    throw new Error(`Unknown string representation of number: ${value}`);
}

export function serializeNumber(value: number) : NumberDescriptor {
    return {
        type: 'number',
        value: serializableNumberRepresentation(value, false),
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
