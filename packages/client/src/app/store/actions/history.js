export const setHistory = ({ commit }, payload) => {
    commit('SET_HISTORY', payload);
};

export const addToHistory = ({ commit }, payload) => {
    commit('ADD_HISTORY_TRANSACTION', payload);
};

export const removeFromHistory = ({ commit }, payload) => {
    commit('REMOVE_FROM_HISTORY', payload);
};

export const updateOfflineEntry = (store, payload) => {
    if (store.state.ui.lastUser.localId === payload.localId) {
        store.commit('SET_LAST_USER', {
            ...store.state.ui.lastUser,
            name: `${payload.basketData.firstname} ${payload.basketData.lastname}`
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

export const incrementCatering = (store, id) => {
    store.commit('INCREMENT_CATERING', id);
};
