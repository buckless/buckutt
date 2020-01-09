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

describe('SET_TICKETS()', () => {
    describe('given an empty state', () => {
        const state = { ticketsByWalletId: null };

        reducer.SET_TICKETS(state, {});

        it('updated the state', () => {
            expect(state.ticketsByWalletId).toEqual({});
        });
    });
});

describe('SET_TICKET()', () => {
    describe('given an empty state', () => {
        const state = {
            ticketsByWalletId: { a: null },
            activeWallet: 'a'
        };

        reducer.SET_TICKET(state, { foo: 'bar' });

        it('updated the state', () => {
            expect(state.ticketsByWalletId.a).toEqual({ foo: 'bar' });
        });
    });
});
