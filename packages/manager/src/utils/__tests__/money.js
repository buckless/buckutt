import { format, isValid } from '../money';

describe('format()', () => {
    describe('given an amount', () => {
        const res = format({ amount: 10000 });

        it('returns a formatted amount', () => {
            // format uses non breakable space
            expect(res).toMatch(/100[.,]00/);
        });
    });

    describe('given an amount and a currency', () => {
        const res = format({ amount: 10000, currency: 'USD' });

        it('returns a formatted amount', () => {
            // format uses non breakable space
            expect(res).toMatch(/100[.,]00/);
        });
    });

    describe('given an amount, a currency and a language', () => {
        const res = format({ amount: 10000, currency: 'USD', language: 'en-US' });

        it('returns a formatted amount', () => {
            expect(res).toMatch(/100[.,]00/);
        });
    });
});

describe('isValid()', () => {
    const validAmounts = [10, '10', 10.2, '10.20'];

    describe.each(validAmounts)('given an amount (%s)', amount => {
        it('returns true', () => {
            expect(isValid(amount)).toBe(true);
        });
    });

    const invalidAmounts = ['a', '10.12345', '10e5'];

    describe.each(invalidAmounts)('given an amount (%s)', amount => {
        it('returns false', () => {
            expect(isValid(amount)).toBe(false);
        });
    });
});
