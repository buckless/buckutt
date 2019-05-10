export const sellerLogged = state => !!state.auth.seller.id;
export const buyerLogged = state => !!state.auth.buyer.wallet;

export const tokenHeaders = (state, getters) => {
    if (!getters.sellerLogged) {
        return {};
    }

    return {
        headers: {
            Authorization: `Bearer ${state.auth.seller.token}`
        }
    };
};

export const loginState = (state, getters) =>
    state.auth.device.config.doubleValidation ? !getters.buyerLogged : !getters.sellerLogged;
