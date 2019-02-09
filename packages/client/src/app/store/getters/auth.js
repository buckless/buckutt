export const tokenHeaders = state => {
    if (!state.auth.seller.token || state.auth.seller.token.length === 0) {
        return {};
    }

    return {
        headers: {
            Authorization: `Bearer ${state.auth.seller.token}`
        }
    };
};

export const loginState = state => {
    if (state.auth.device.config.doubleValidation) {
        return !state.auth.buyer.isAuth;
    }

    return !state.auth.seller.isAuth;
};
