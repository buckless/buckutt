export const addToHistory = (_, payload) => {
    return window.database.insert('history', payload);
};

export const removeFromHistory = (_, payload) => {
    return window.database.delete('history', payload.localId);
};

export const updateOfflineEntry = (store, payload) => {
    if (store.state.ui.lastUser.localId === payload.localId) {
        store.commit('SET_LAST_USER', {
            ...store.state.ui.lastUser,
            name: payload.basketData.user
                ? `${payload.basketData.user.firstname} ${payload.basketData.user.lastname}`
                : null
        });
    }
};

export const cancelEntry = (store, payload) => {
    const localId = `transaction-id-${window.appId}-${Date.now()}`;
    const transactionToSend = {
        walletId: payload.cardNumber,
        date: new Date(),
        basket: payload.basketToSend,
        seller: store.state.auth.seller.id,
        localId,
        isCancellation: true
    };

    if (payload.failed) {
        return store.dispatch('sendRequest', {
            method: 'post',
            url: 'payment/failedBasket',
            data: transactionToSend
        });
    }

    return store.dispatch('sendRequest', {
        method: 'post',
        url: 'payment/basket',
        data: transactionToSend,
        offlineAnswer: {
            data: {
                credit: store.getters.credit,
                firstname: store.state.auth.buyer.firstname,
                lastname: store.state.auth.buyer.lastname
            }
        }
    });
};
