import { hasError, areErrorsOnlyFalse, buildValidation } from '../formValidation';

const $set = (obj, key, value) => {
    obj[key] = value;
};

describe('hasError()', () => {
    describe('given a empty errors object', () => {
        const errors = {};
        const res = hasError(errors);

        it('returns false', () => {
            expect(res).toBe(false);
        });
    });

    describe('given a false-only errors object', () => {
        const errors = { foo: false };
        const res = hasError(errors);

        it('returns false', () => {
            expect(res).toBe(false);
        });
    });

    describe('given a non-empty errors object', () => {
        const errors = { foo: 'bar' };
        const res = hasError(errors);

        it('returns true', () => {
            expect(res).toBe(true);
        });
    });
});

describe('areErrorsOnlyFalse()', () => {
    describe('given a false only object', () => {
        const data = { foo: false, bar: false };
        const res = areErrorsOnlyFalse(data);

        it('returns true', () => {
            expect(res).toBe(true);
        });
    });

    describe('given a object containing one truthy value', () => {
        const data = { foo: false, bar: 'a', baz: false };
        const res = areErrorsOnlyFalse(data);

        it('returns false', () => {
            expect(res).toBe(false);
        });
    });
});

describe('buildValidation()', () => {
    describe('given an array of fields name and a validation function', () => {
        const dumbValidation = ({ foo, bar }) => ({
            foo: foo !== 'foo' ? 'invalidFoo' : false,
            bar: bar !== 'bar' ? 'invalidBar' : false
        });

        const validator = buildValidation(['foo', 'bar'], dumbValidation);

        describe('when called with an invalid vm state', () => {
            const vm = { foo: 'a', bar: 'bar', errors: {} };

            validator.call(vm);

            it('sets the error field', () => {
                expect(vm.errors).toEqual({
                    foo: 'invalidFoo',
                    bar: false
                });
            });
        });

        describe('when called with a valid vm state', () => {
            const vm = { foo: 'foo', bar: 'bar', errors: {}, $set };

            validator.call(vm);

            it('does not sets the error field', () => {
                expect(vm.errors).toEqual({});
            });
        });

        describe('when called with a invalid vm state and a specific field event', () => {
            const vm = { foo: 'a', bar: 'b', errors: {}, $set };

            validator.call(vm, { target: { name: 'foo' } });

            it('only sets the error on the specific field', () => {
                expect(vm.errors).toEqual({
                    foo: 'invalidFoo'
                });
            });
        });

        describe('when called with a valid vm state and a specific field event', () => {
            const vm = { foo: 'foo', bar: 'bar', errors: {}, $set };

            validator.call(vm, { target: { name: 'foo' } });

            it('only sets the false value on the specific error field', () => {
                expect(vm.errors).toEqual({
                    foo: false
                });
            });
        });
    });
});
