import {
    getError,
    getIsFetching,
    getWallets,
    getActiveWallet,
    getLinkModalOpened
} from '../selectors';

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

describe('getWallets()', () => {
    describe('given a state with a normalized wallets object', () => {
        const state = {
            wallets: {
                a: { id: 'a' },
                b: { id: 'b' }
            }
        };
        const res = getWallets(state);

        it('returns its value', () => {
            expect(res).toEqual([{ id: 'a' }, { id: 'b' }]);
        });
    });
});

describe('getActiveWallet()', () => {
    describe('given a state with an active wallet', () => {
        const state = {
            wallets: {
                a: { id: 'a' },
                b: { id: 'b' }
            },
            activeWallet: 'a'
        };
        const res = getActiveWallet(state);

        it('returns its value', () => {
            expect(res).toEqual({ id: 'a' });
        });
    });

    describe('given a state with no active wallet', () => {
        const state = {
            wallets: {
                a: { id: 'a' },
                b: { id: 'b' }
            },
            activeWallet: null
        };
        const res = getActiveWallet(state);

        it('returns its value', () => {
            expect(res).toBe(null);
        });
    });
});

describe('getLinkModalOpened()', () => {
    describe('given a state with a linkModalOpened object', () => {
        const state = { linkModalOpened: false };
        const res = getLinkModalOpened(state);

        it('returns its value', () => {
            expect(res).toBe(false);
        });
    });
});
