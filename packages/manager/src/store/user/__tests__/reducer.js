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

describe('SET_USER()', () => {
    describe('given an empty state', () => {
        const state = { user: null };

        reducer.SET_USER(state, {});

        it('updated the state', () => {
            expect(state.user).toEqual({});
        });
    });
});

describe('SET_TOKEN()', () => {
    describe('given an empty state', () => {
        const state = { token: null };
        const token = 'token';

        reducer.SET_TOKEN(state, token);

        it('updated the state', () => {
            expect(state.token).toBe(token);
        });
    });
});

describe('SET_LANGUAGE_MODAL_OPENED()', () => {
    describe('given an empty state', () => {
        const state = { languageModalOpened: false };

        reducer.SET_LANGUAGE_MODAL_OPENED(state, true);

        it('updated the state', () => {
            expect(state.languageModalOpened).toBe(true);
        });
    });
});
