import axios from 'axios';

const cancelUrl = `${config.api}/services/cancelTransaction`;

export const toggleHistory = ({ commit }) => {
    commit('TOGGLE_HISTORY');
};

export const removeFromHistory = ({ commit }, payload) => {
    commit('REMOVE_FROM_HISTORY', payload);
};

export const cancelEntry = (store, payload) => {
    payload.transactionIds = store.state.history.history
        .find(entry => entry.localId === payload.localId)
        .transactionIds;

    if (!payload.transactionIds) {
        store.commit('ADD_PENDING_CANCELLATION', payload);
    } else {
        // request made online

        const cancelPurchases = payload.transactionIds.purchases.map((id) => ({
            rawType: 'purchase',
            id
        }));

        const cancelReloads = payload.transactionIds.reloads.map((id) => ({
            rawType: 'reload',
            id
        }));

        if (store.state.online.status) {
            // we're still online

            const reqs = cancelPurchases
                .concat(cancelReloads)
                .map(body => axios.post(cancelUrl, body, store.getters.tokenHeaders));

            return Promise.all(reqs);
        } else {
            // we're offline

            cancelPurchases
                .concat(cancelReloads)
                .map(body => store.dispatch('addPendingRequest', {
                    url: cancelUrl,
                    body
                }));

            return Promise.resolve();
        }
    }
};

export const sendValidCancellations = (store) => {
    const cancellations = store.state.history.pendingCancellations
        .filter(pending => pending.transactionIds)
        .map((pending) => {
            const cancelPurchases = pending.transactionIds.purchases.map((id) => ({
                rawType: 'purchase',
                id
            }));

            const cancelReloads = pending.transactionIds.reloads.map((id) => ({
                rawType: 'reload',
                id
            }));

            return cancelPurchases.concat(cancelReloads);
        })
        .map(bodys =>
            Promise.all(bodys.map(body => axios.post(cancelUrl, body, store.getters.tokenHeaders)))
        );

    return Promise
        .all(cancellations)
        .then(() => {
            store.state.history.pendingCancellations
                .filter(pending => pending.transactionIds)
                .forEach((pending) => {
                    store.commit('REMOVE_PENDING_CANCELLATION', pending);
                });
        });
};
