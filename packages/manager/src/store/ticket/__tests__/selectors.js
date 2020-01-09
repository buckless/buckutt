import { getError, getIsFetching, getTickets, getActiveTicket } from '../selectors';

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

describe('getTickets()', () => {
    describe('given a state with a normalized wallets object', () => {
        const state = {
            ticketsByWalletId: {
                a: { id: 'T-a' },
                b: { id: 'T-b' }
            }
        };
        const res = getTickets(state);

        it('returns its value', () => {
            expect(res).toEqual([{ id: 'T-a' }, { id: 'T-b' }]);
        });
    });
});

describe('getActiveTicket()', () => {
    describe('given a state with an active wallet', () => {
        const state = {
            ticketsByWalletId: {
                a: { id: 'T-a' },
                b: { id: 'T-b' }
            },
            activeWallet: 'a'
        };
        const res = getActiveTicket(state);

        it('returns its value', () => {
            expect(res).toEqual({ id: 'T-a' });
        });
    });

    describe('given a state with no active wallet', () => {
        const state = {
            ticketsByWalletId: {
                a: { id: 'T-a' },
                b: { id: 'T-b' }
            },
            activeWallet: null
        };
        const res = getActiveTicket(state);

        it('returns its value', () => {
            expect(res).toBe(null);
        });
    });
});
