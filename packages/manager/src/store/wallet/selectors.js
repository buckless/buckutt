export const getIsFetching = state => state.isFetching;

export const getError = state => state.error;

export const getWallets = state => Object.values(state.wallets);

export const getActiveWallet = state => {
    if (!state.activeWallet) {
        return null;
    }

    return state.wallets[state.activeWallet];
};

export const getLinkModalOpened = state => state.linkModalOpened;
