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

describe('SET_HISTORY()', () => {
    describe('given an empty state', () => {
        const state = { history: [] };

        reducer.SET_HISTORY(state, ['a']);

        it('updated the state', () => {
            expect(state.history).toEqual(['a']);
        });
    });
});

describe('SET_PENDING()', () => {
    describe('given an empty state', () => {
        const state = { pending: 0 };

        reducer.SET_PENDING(state, 20);

        it('updated the state', () => {
            expect(state.pending).toBe(20);
        });
    });
});
