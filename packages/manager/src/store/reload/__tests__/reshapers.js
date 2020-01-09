import { reshapeReload, reshapeAmount } from '../reshapers';

describe('reshapeReload()', () => {
    describe('given a Reload object', () => {
        const reload = { type: 'url', res: 'http://localhost' };
        const res = reshapeReload(reload);

        it('returns a reshaped object', () => {
            expect(res).toEqual({
                outcome: 'success',
                type: 'url',
                data: {
                    nextUrl: 'http://localhost'
                }
            });
        });
    });
});

describe('reshapeAmount()', () => {
    describe('given an amount with some paymentCosts', () => {
        const amount = 1000;
        const paymentCosts = { fixedCostsReload: 25, variableCostsReload: 1 };
        const res = reshapeAmount(amount, paymentCosts);

        it('returns the reshaped amount', () => {
            expect(res).toEqual(1035);
        });
    });
});
