// @flow
export type UnserializableNumber = 'NaN' | 'Infinity' | '-Infinity' | '-0';
export type NumberDescriptor = {
    value: UnserializableNumber | number;
    type: 'number';
};
export type StringDescriptor = {
    value: string;
    type: 'string';
};
export type UndefinedDescriptor = {
    type: 'undefined'
};
export type BooleanDescriptor = {
    value: boolean;
    type: 'boolean';
}
export type SymbolDescriptor = {
    value: string;
    type: 'symbol';
}
export type RemoteObjectId = number;
export type NullDescriptor = {
    type: 'null';
};
export type PlainObjectDescriptor = {
    type: 'object';
    subType: null;
    objectId: RemoteObjectId;
    size?: null;
}
export type IterableDescriptor = {
    type: 'object';
    subType: 'iterable';
    objectId: RemoteObjectId;
    size?: number|UnserializableNumber;
}
export type ListDescriptor = {
    type: 'object';
    className: string;
    subType: 'list';
    objectId: RemoteObjectId;
    size: number|UnserializableNumber;
}
export type RegExpDescriptor = {
    type: 'object';
    className: string;
    subType: 'regexp';
    objectId: RemoteObjectId;
    value: {
        source: string;
        flags: string;
    };
    size?: null;
}
export type MapDescriptor = {
    type: 'object';
    className: string;
    subType: 'map';
    objectId: RemoteObjectId;
    size: number|UnserializableNumber;
}
export type SetDescriptor = {
    type: 'object';
    className: string;
    subType: 'set';
    objectId: RemoteObjectId;
    size: number|UnserializableNumber;
}
export type DateDescriptor = {
    type: 'object';
    className: string;
    subType: 'date';
    objectId: RemoteObjectId;
    value: number;
    size?: null;
}
export type EntriesDescriptor = {
    result: [any],
    done: boolean,
    iteratorId: ?number,
}
export type FunctionDescriptor = {
    type: 'function';
    name: string;
}
export type ObjectDescriptor = PlainObjectDescriptor | ListDescriptor | IterableDescriptor | DateDescriptor | MapDescriptor | SetDescriptor | RegExpDescriptor;
export type ObjectSerializer = (value: Object) => ObjectDescriptor | false;
export type FunctionSerializer = (value: Function) => FunctionDescriptor;
export type ValueDescriptor = (NullDescriptor | NumberDescriptor | UndefinedDescriptor | BooleanDescriptor | StringDescriptor | SymbolDescriptor | ObjectDescriptor);
export type Serializer = (value: any) => ValueDescriptor;
