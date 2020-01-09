export const initialState = {
    isFetching: false,
    error: null,
    userWallets: []
};

export const reducer = {
    SET_IS_FETCHING(state, isFetching) {
        state.isFetching = isFetching;
    },

    SET_ERROR(state, error) {
        state.error = error;
    },

    SET_USER_WALLETS(state, userWallets) {
        state.userWallets = userWallets;
    }
};
