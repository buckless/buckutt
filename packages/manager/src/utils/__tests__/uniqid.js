import { generate } from '../uniqid';

describe('generate()', () => {
    describe('when called the first time with a prefix', () => {
        const res = generate('test');
        const res1 = generate('test');

        it('returns an unique id', () => {
            expect(res).toBe('test-0');
            expect(res1).toBe('test-1');
        });
    });

    describe('when called with another prefix', () => {
        const res = generate('test2');
        const res1 = generate('test2');

        it('returns an unique id', () => {
            expect(res).toBe('test2-0');
            expect(res1).toBe('test2-1');
        });
    });
});
