// @flow
export type UnserializableNumber = 'NaN' | 'Infinity' | '-Infinity' | '-0';
export type NumberDescription = {
    value: UnserializableNumber | number;
    type: 'number';
};
export type StringDescription = {
    value: string;
    type: 'string';
};
export type UndefinedDescription = {
    type: 'undefined'
};
export type BooleanDescription = {
    value: boolean;
    type: 'boolean';
}
export type SymbolDescription = {
    value: string;
    type: 'symbol';
}
export type RemoteObjectId = number;
export type NullDescription = {
    type: 'object';
    subType: 'null';
};
export type PlainObjectDescription = {
    type: 'object';
    objectId: RemoteObjectId;
}
export type ArrayDescription = {
    type: 'object';
    subType: 'array';
    objectId: RemoteObjectId;
    size: number;
}
export type ObjectDescription = NullDescription | PlainObjectDescription | ArrayDescription;
export type ValueDescription = (NumberDescription | UndefinedDescription | BooleanDescription | StringDescription | SymbolDescription | ObjectDescription);
export type Serializer = (value: any) => ValueDescription;
