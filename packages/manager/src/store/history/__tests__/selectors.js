import { getError, getIsFetching, getHistory, getPending } from '../selectors';

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

describe('getHistory()', () => {
    describe('given a state with a history array', () => {
        const state = { history: ['a'] };
        const res = getHistory(state);

        it('returns its value', () => {
            expect(res).toEqual(['a']);
        });
    });
});

describe('getPending()', () => {
    describe('given a state with a pending amount', () => {
        const state = { pending: 100 };
        const res = getPending(state);

        it('returns its value', () => {
            expect(res).toBe(100);
        });
    });
});
