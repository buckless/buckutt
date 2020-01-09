import { getError, getIsFetching, getUser, getToken, getLanguageModalOpened } from '../selectors';

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

describe('getUser()', () => {
    describe('given a state with a user', () => {
        const state = { user: { id: 'foo' } };
        const res = getUser(state);

        it('returns its value', () => {
            expect(res).toEqual({ id: 'foo' });
        });
    });
});

describe('getToken()', () => {
    describe('given a state with a token', () => {
        const state = { token: 'token' };
        const res = getToken(state);

        it('returns its value', () => {
            expect(res).toEqual('token');
        });
    });
});

describe('getLanguageModalOpened()', () => {
    describe('given a state with a languageModalOpened object', () => {
        const state = { languageModalOpened: false };
        const res = getLanguageModalOpened(state);

        it('returns its value', () => {
            expect(res).toBe(false);
        });
    });
});
