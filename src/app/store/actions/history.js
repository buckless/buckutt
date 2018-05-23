export const toggleHistory = ({ commit }) => {
    commit('TOGGLE_HISTORY');
};

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

    store.commit('UPDATE_HISTORY_ENTRY', payload);
    store.commit('UPDATE_PENDING_CANCELLATIONS_ENTRY', payload);
};

export const addPendingCancellation = (store, payload) => {
    store.commit('ADD_PENDING_CANCELLATION', payload);
};

export const removePendingCancellation = (store, payload) => {
    store.commit('REMOVE_PENDING_CANCELLATION', payload);
};

export const setPendingCancellations = (store, payload) => {
    if (payload.length > 0) {
        store.commit('SET_PENDING_CANCELLATIONS', payload);
    } else {
        store.commit('CLEAR_PENDING_CANCELLATIONS');
    }
};

export const cancelEntry = (store, payload) => {
    payload.transactionIds = store.state.history.history.find(
        entry => entry.localId === payload.localId
    ).transactionIds;

    if (!payload.transactionIds) {
        store.dispatch('addPendingCancellation', payload);
    } else {
        const cancelPurchases = payload.transactionIds.purchases.map(id => ({
            rawType: 'purchase',
            id
        }));

        const cancelReloads = payload.transactionIds.reloads.map(id => ({
            rawType: 'reload',
            id
        }));

        const reqs = cancelPurchases.concat(cancelReloads).map(body =>
            store.dispatch('sendRequest', {
                method: 'post',
                url: 'services/cancelTransaction',
                data: body
            })
        );

        return Promise.all(reqs);
    }
};

export const sendValidCancellations = store => {
    const cancellations = store.state.history.pendingCancellations
        .filter(pending => pending.transactionIds)
        .map(pending => {
            const created_at = new Date();

            const cancelPurchases = pending.transactionIds.purchases.map(id => ({
                rawType: 'purchase',
                created_at,
                id
            }));

            const cancelReloads = pending.transactionIds.reloads.map(id => ({
                rawType: 'reload',
                created_at,
                id
            }));

            return cancelPurchases.concat(cancelReloads);
        })
        .map(bodys =>
            Promise.all(
                bodys.map(body =>
                    store.dispatch('sendRequest', {
                        method: 'post',
                        url: 'services/cancelTransaction',
                        data: body
                    })
                )
            )
        );

    return Promise.all(cancellations).then(() => {
        store.state.history.pendingCancellations
            .filter(pending => pending.transactionIds)
            .forEach(pending => {
                store.dispatch('removePendingCancellation', pending);
            });
    });
};
