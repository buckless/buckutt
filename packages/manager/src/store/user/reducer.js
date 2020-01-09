export const initialState = {
    isFetching: false,
    error: null,
    user: null,
    token: null,
    languageModalOpened: false
};

export const reducer = {
    SET_IS_FETCHING(state, isFetching) {
        state.isFetching = isFetching;
    },

    SET_ERROR(state, error) {
        state.error = error;
    },

    SET_USER(state, user) {
        state.user = user;
    },

    SET_TOKEN(state, token) {
        state.token = token;
    },

    SET_LANGUAGE_MODAL_OPENED(state, languageModalOpened) {
        state.languageModalOpened = languageModalOpened;
    }
};
