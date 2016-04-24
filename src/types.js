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
    type: 'object';
    subType: 'null';
};
export type PlainObjectDescriptor = {
    type: 'object';
    objectId: RemoteObjectId;
}
export type IterableDescriptor = {
    type: 'object';
    subType: 'iterable';
    objectId: RemoteObjectId;
    size?: number;
}
export type ListDescriptor = {
    type: 'object';
    className: string;
    subType: 'list';
    objectId: RemoteObjectId;
    size: number;
}
export type RegExpDescriptor = {
    type: 'object';
    className: string;
    subType: 'regexp';
    objectId: RemoteObjectId;
    value: {
        source: string;
        flags: string;
    }
}
export type MapDescriptor = {
    type: 'object';
    className: string;
    subType: 'map';
    objectId: RemoteObjectId;
    size: number;
}
export type SetDescriptor = {
    type: 'object';
    className: string;
    subType: 'set';
    objectId: RemoteObjectId;
    size: number;
}
export type DateDescriptor = {
    type: 'object';
    className: string;
    subType: 'date';
    objectId: RemoteObjectId;
    value: number;
}
export type EntriesDescriptor = {
    result: Iterable<any>,
    done: boolean,
    iteratorId: ?number,
}
export type ObjectDescriptor = NullDescriptor | PlainObjectDescriptor | ListDescriptor | IterableDescriptor | DateDescriptor | MapDescriptor | SetDescriptor | RegExpDescriptor;
export type ObjectSerializer = (value: Object) => ObjectDescriptor | false;
export type ValueDescriptor = (NumberDescriptor | UndefinedDescriptor | BooleanDescriptor | StringDescriptor | SymbolDescriptor | ObjectDescriptor);
export type Serializer = (value: any) => ValueDescriptor;
