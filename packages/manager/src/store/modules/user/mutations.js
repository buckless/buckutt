export const SET_USER = (state, payload) => {
    state.user = payload;
};

export const SET_CURRENT_WALLET = (state, payload) => {
    state.currentWallet = payload;
};

export const UPDATE_CURRENT_WALLET = (state, payload) => {
    state.user.wallets = state.user.wallets.map(wallet => {
        if (wallet.id !== state.currentWallet) {
            return wallet;
        }

        return Object.assign({}, wallet, payload);
    });
};

export const ADD_WALLET = (state, payload) => {
    state.user.wallets.push(payload);
};

export const SET_GIFT_RELOADS = (state, payload) => {
    state.giftReloads = payload;
};

export const SET_PAYMENT_COSTS = (state, payload) => {
    state.costs = payload;
};

export const BLOCK_CARD = (state, logicalId) => {
    if (!state.user) {
        return;
    }

    state.user.wallets = state.user.wallets.map(wallet => {
        if (wallet.logicalId === logicalId) {
            return {
                ...wallet,
                blocked: true
            };
        }

        return wallet;
    });
};
