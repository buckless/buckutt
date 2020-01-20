export const initialState = {
    isFetching: false,
    error: null,
    wallets: {},
    activeWallet: null,
    reloadAllowed: false,
    chooserModalOpened: false,
    linkModalOpened: false
};

export const reducer = {
    SET_IS_FETCHING(state, isFetching) {
        state.isFetching = isFetching;
    },

    SET_ERROR(state, error) {
        state.error = error;
    },

    SET_WALLETS(state, wallets) {
        state.wallets = wallets;
    },

    SET_ACTIVE_WALLET(state, activeWallet) {
        state.activeWallet = activeWallet;
    },

    UPDATE_WALLET_CREDIT(state, credit) {
        state.wallets[state.activeWallet].credit = credit;
    },

    SET_RELOAD_ALLOWED(state, reloadAllowed) {
        state.reloadAllowed = reloadAllowed;
    },

    SET_CHOOSER_MODAL_OPENED(state, chooserModalOpened) {
        state.chooserModalOpened = chooserModalOpened;
    },

    SET_LINK_MODAL_OPENED(state, linkModalOpened) {
        state.linkModalOpened = linkModalOpened;
    },

    SET_WALLET(state, wallet) {
        state.wallets[wallet.id] = wallet;
    }
};
