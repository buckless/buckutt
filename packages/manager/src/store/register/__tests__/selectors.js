import { getError, getIsFetching, getRegisterFormData, getRegisterState } from '../selectors';

describe('getError()', () => {
    describe('given a state with an error', () => {
        const state = { error: new Error() };
        const res = getError(state);

        it('returns the error', () => {
            expect(res).toBeInstanceOf(Error);
        });
    });
});

describe('getIsFetching()', () => {
    describe('given a state with an isFetching boolean', () => {
        const state = { isFetching: true };
        const res = getIsFetching(state);

        it('returns its value', () => {
            expect(res).toBe(true);
        });
    });
});

describe('getRegisterFormData()', () => {
    describe('given a state with a user', () => {
        const state = { userInfos: { id: 'foo', firstName: 'John', lastName: 'Doe' } };
        const res = getRegisterFormData(state);

        it('returns its value', () => {
            expect(res).toEqual({ firstname: 'John', lastname: 'Doe' });
        });
    });
});

describe('getRegisterState()', () => {
    describe('given a state with a user', () => {
        const state = { step: 'card' };
        const res = getRegisterState(state);

        it('returns its value', () => {
            expect(res).toBe('card');
        });
    });
});
