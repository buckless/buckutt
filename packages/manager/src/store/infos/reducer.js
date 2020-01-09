export const initialState = {
    isFetching: false,
    error: null,
    giftReloads: [],
    paymentCosts: [],
    meansOfPayment: {},
    reloadAllowed: false
};

export const reducer = {
    SET_IS_FETCHING(state, isFetching) {
        state.isFetching = isFetching;
    },

    SET_ERROR(state, error) {
        state.error = error;
    },

    SET_GIFT_RELOADS(state, giftReloads) {
        state.giftReloads = giftReloads;
    },

    SET_PAYMENT_COSTS(state, paymentCosts) {
        state.paymentCosts = paymentCosts;
    },

    SET_MEANS_OF_PAYMENT(state, meansOfPayment) {
        state.meansOfPayment = meansOfPayment;
    },

    SET_RELOAD_ALLOWED(state, reloadAllowed) {
        state.reloadAllowed = reloadAllowed;
    }
};
