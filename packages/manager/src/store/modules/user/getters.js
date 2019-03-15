export const user = state => state.user;
export const credit = state =>
    state.user ? state.user.wallets.find(wallet => wallet.id === state.currentWallet).credit : 0;
export const wallets = state => state.user.wallets;
export const currentWallet = state => state.currentWallet;

export const giftReloads = state => state.giftReloads;

export const hasCard = state => {
    if (!state.user || !state.currentWallet) {
        return false;
    }

    const wallet = state.user.wallets.find(wallet => wallet.id === state.currentWallet);

    return Boolean(wallet.logical_id);
};

export const cardBlocked = state => {
    if (!state.user || !state.currentWallet) {
        return null;
    }

    const wallet = state.user.wallets.find(wallet => wallet.id === state.currentWallet);

    return wallet && wallet.blocked;
};

export const card = state => {
    if (!state.user || !state.currentWallet) {
        return null;
    }

    const wallet = state.user.wallets.find(wallet => wallet.id === state.currentWallet);

    return wallet && (wallet.physical_id || wallet.logical_id);
};

export const ticket = state => {
    if (!state.user || !state.currentWallet) {
        return null;
    }

    const wallet = state.user.wallets.find(wallet => wallet.id === state.currentWallet);

    return wallet && wallet.ticket && (wallet.ticket.physical_id || wallet.ticket.logical_id);
};
