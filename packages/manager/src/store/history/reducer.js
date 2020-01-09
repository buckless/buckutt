export const initialState = {
    isFetching: false,
    error: null,
    history: [],
    pending: 0
};

export const reducer = {
    SET_IS_FETCHING(state, isFetching) {
        state.isFetching = isFetching;
    },

    SET_ERROR(state, error) {
        state.error = error;
    },

    SET_HISTORY(state, history) {
        state.history = history;
    },

    SET_PENDING(state, pending) {
        state.pending = pending;
    }
};
