import { reducer } from '../reducer';

describe('SET_IS_FETCHING()', () => {
    describe('given an empty state', () => {
        const state = { isFetching: false };

        reducer.SET_IS_FETCHING(state, true);

        it('updated the state', () => {
            expect(state.isFetching).toBe(true);
        });
    });
});

describe('SET_ERROR()', () => {
    describe('given an empty state', () => {
        const state = { error: null };

        reducer.SET_ERROR(state, new Error());

        it('updated the state', () => {
            expect(state.error).toBeInstanceOf(Error);
        });
    });
});

describe('SET_USER_WALLETS()', () => {
    describe('given an empty state', () => {
        const state = { userWallets: [] };

        reducer.SET_USER_WALLETS(state, [{ foo: 'bar' }]);

        it('updated the state', () => {
            expect(state.userWallets).toEqual([{ foo: 'bar' }]);
        });
    });
});
