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

describe('SET_WALLETS()', () => {
    describe('given an empty state', () => {
        const state = { wallets: null };

        reducer.SET_WALLETS(state, {});

        it('updated the state', () => {
            expect(state.wallets).toEqual({});
        });
    });
});

describe('SET_ACTIVE_WALLET()', () => {
    describe('given an empty state', () => {
        const state = { activeWallet: null };

        reducer.SET_ACTIVE_WALLET(state, 'a');

        it('updated the state', () => {
            expect(state.activeWallet).toBe('a');
        });
    });
});

describe('UPDATE_WALLET_CREDIT()', () => {
    describe('given an empty state', () => {
        const state = {
            wallets: { a: { id: 'a', credit: 10 }, b: { id: 'b', credit: 10 } },
            activeWallet: 'b'
        };

        reducer.UPDATE_WALLET_CREDIT(state, 50);

        it('updated the state', () => {
            expect(state.wallets.b.credit).toBe(50);
        });
    });
});

describe('SET_WALLET()', () => {
    describe('given an empty state', () => {
        const state = {
            wallets: { a: { id: 'a', credit: 10 }, b: { id: 'b', credit: 10 } },
            activeWallet: 'a'
        };

        reducer.SET_WALLET(state, { id: 'a', credit: 20 });

        it('updated the state', () => {
            expect(state.wallets.a).toEqual({ id: 'a', credit: 20 });
        });
    });
});

describe('SET_LINK_MODAL_OPENED()', () => {
    describe('given an empty state', () => {
        const state = { linkModalOpened: false };

        reducer.SET_LINK_MODAL_OPENED(state, true);

        it('updated the state', () => {
            expect(state.linkModalOpened).toBe(true);
        });
    });
});

describe('SET_WALLET()', () => {
    describe('given an empty state', () => {
        const state = { wallets: { a: { id: 'a' } } };

        reducer.SET_WALLET(state, { id: 'b' });

        it('updated the state', () => {
            expect(state.wallets).toEqual({ a: { id: 'a' }, b: { id: 'b' } });
        });
    });
});
