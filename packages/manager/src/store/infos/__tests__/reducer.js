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

describe('SET_GIFT_RELOADS()', () => {
    describe('given an empty state', () => {
        const state = { giftReloads: [] };

        reducer.SET_GIFT_RELOADS(state, ['a']);

        it('updated the state', () => {
            expect(state.giftReloads).toEqual(['a']);
        });
    });
});

describe('SET_PAYMENT_COSTS()', () => {
    describe('given an empty state', () => {
        const state = { paymentCosts: [] };

        reducer.SET_PAYMENT_COSTS(state, ['a']);

        it('updated the state', () => {
            expect(state.paymentCosts).toEqual(['a']);
        });
    });
});

describe('SET_MEANS_OF_PAYMENT()', () => {
    describe('given an empty state', () => {
        const state = { meansOfPayment: [] };

        reducer.SET_MEANS_OF_PAYMENT(state, { foo: 'Bar' });

        it('updated the state', () => {
            expect(state.meansOfPayment).toEqual({ foo: 'Bar' });
        });
    });
});

describe('SET_RELOAD_ALLOWED()', () => {
    describe('given an empty state', () => {
        const state = { reloadAllowed: false };

        reducer.SET_RELOAD_ALLOWED(state, true);

        it('updated the state', () => {
            expect(state.reloadAllowed).toBe(true);
        });
    });
});

describe('SET_EVENT()', () => {
    describe('given an empty state', () => {
        const state = { event: {} };

        reducer.SET_EVENT(state, { foo: 'Bar' });

        it('updated the state', () => {
            expect(state.event).toEqual({ foo: 'Bar' });
        });
    });
});
