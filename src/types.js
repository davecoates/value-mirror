// @flow
export type UnserializableNumber = 'NaN' | 'Infinity' | '-Infinity' | '-0';
export type NumberMirror = {
    value: UnserializableNumber | number;
    type: 'number';
};
export type StringMirror = {
    value: string;
    type: 'string';
};
export type UndefinedMirror = {
    type: 'undefined'
};
export type BooleanMirror = {
    value: boolean;
    type: 'boolean';
}
export type SymbolMirror = {
    value: string;
    type: 'symbol';
}
export type RemoteObjectId = number;
export type NullMirror = {
    type: 'object';
    subType: 'null';
};
export type PlainObject = {
    type: 'object';
    objectId: RemoteObjectId;
}
export type ObjectMirror = NullMirror | PlainObject;
export type Mirror = (NumberMirror | UndefinedMirror | BooleanMirror | StringMirror | SymbolMirror | ObjectMirror);
/* eslint-disable */
export interface LiveMirror {
    value: any;
    objectId: ?RemoteObjectId;
    serialize() : Mirror;
}
export type LiveMirrorMaker = (value: any) => LiveMirror;
