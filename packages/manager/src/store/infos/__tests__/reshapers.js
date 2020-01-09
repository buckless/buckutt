import { reshapeReloads } from '../reshapers';

describe('reshapeReloads()', () => {
    // null - null
    describe('given a null start and a null end', () => {
        const reloads = { start: null, end: null };
        const res = reshapeReloads(reloads);

        it('returns true', () => {
            expect(res).toBe(true);
        });
    });

    // previous - null
    describe('given a previous start and a null end', () => {
        const reloads = { start: Date.now() - 5000, end: null };
        const res = reshapeReloads(reloads);

        it('returns true', () => {
            expect(res).toBe(true);
        });
    });

    // future - null
    describe('given a future start and a null end', () => {
        const reloads = { start: Date.now() + 5000, end: null };
        const res = reshapeReloads(reloads);

        it('returns false', () => {
            expect(res).toBe(false);
        });
    });

    // null - previous
    describe('given a null start and a previous end', () => {
        const reloads = { start: null, end: Date.now() - 1000 };
        const res = reshapeReloads(reloads);

        it('returns false', () => {
            expect(res).toBe(false);
        });
    });

    // previous - previous
    describe('given a previous start and a previous end', () => {
        const reloads = { start: Date.now() - 5000, end: Date.now() - 1000 };
        const res = reshapeReloads(reloads);

        it('returns false', () => {
            expect(res).toBe(false);
        });
    });

    // future - previous - impossible

    // null - future
    describe('given a null start and a future end', () => {
        const reloads = { start: null, end: Date.now() + 1000 };
        const res = reshapeReloads(reloads);

        it('returns true', () => {
            expect(res).toBe(true);
        });
    });

    // previous - future - impossible

    // future - future
    describe('given a null start and a future end', () => {
        const reloads = { start: Date.now() + 1000, end: Date.now() + 5000 };
        const res = reshapeReloads(reloads);

        it('returns false', () => {
            expect(res).toBe(false);
        });
    });
});
