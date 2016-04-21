import objectMirror from '../src/objectMirror';
import expect from 'expect';

describe('Value Mirror (objects)', () => {
    it('should handle numbers', () => {
        expect(objectMirror(null).serialize()).toEqual({
            type: 'object',
            subType: 'null',
        });
    });
});
