import {
    getError,
    getIsFetching,
    getIsReloadAllowed,
    getGiftReloads,
    getMeansOfPayment,
    getPaymentCosts,
    getEvent
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

describe('getIsReloadAllowed()', () => {
    describe('given a state with reload allowed', () => {
        const state = { reloadAllowed: true };
        const res = getIsReloadAllowed(state);

        it('returns its value', () => {
            expect(res).toBe(true);
        });
    });
});

describe('getGiftReloads()', () => {
    describe('given a state with a giftReloads array', () => {
        const state = { giftReloads: ['a'] };
        const res = getGiftReloads(state);

        it('returns its value', () => {
            expect(res).toEqual(['a']);
        });
    });
});

describe('getMeansOfPayment()', () => {
    describe('given a state with a meansOfPayment object', () => {
        const state = { meansOfPayment: { foo: 'Bar' } };
        const res = getMeansOfPayment(state);

        it('returns its value', () => {
            expect(res).toEqual({ foo: 'Bar' });
        });
    });
});

describe('getPaymentCosts()', () => {
    describe('given a state with a paymentCosts object', () => {
        const state = { paymentCosts: { foo: 0 } };
        const res = getPaymentCosts(state);

        it('returns its value', () => {
            expect(res).toEqual({ foo: 0 });
        });
    });
});

describe('getEvent()', () => {
    describe('given a state with a event object', () => {
        const state = { event: { foo: 'Bar' } };
        const res = getEvent(state);

        it('returns its value', () => {
            expect(res).toEqual({ foo: 'Bar' });
        });
    });
});
