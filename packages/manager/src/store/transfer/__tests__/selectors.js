import { getError, getIsFetching, getUserWallets } from '../selectors';

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

describe('getUserWallets()', () => {
    describe('given a state with an userWallets array', () => {
        const state = { userWallets: [{ foo: 'bar' }] };
        const res = getUserWallets(state);

        it('returns its value', () => {
            expect(res).toEqual([{ foo: 'bar' }]);
        });
    });
});
