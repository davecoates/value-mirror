import type { FunctionDescriptor } from './types';
export default function serializeFunction(value: Function) : FunctionDescriptor {
    return {
        type: 'function',
        name: value.name,
        value: value.toString(),
    };
}
