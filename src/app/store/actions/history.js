import axios from '@/utils/axios';

const cancelUrl = `${config.api}/services/cancelTransaction`;

export const toggleHistory = ({ commit }) => {
    commit('TOGGLE_HISTORY');
};

export const removeFromHistory = ({ commit }, payload) => {
    commit('REMOVE_FROM_HISTORY', payload);
};

export const setPendingCancellations = (store, payload) => {
    if (payload.length > 0) {
        store.commit('SET_PENDING_CANCELLATIONS', payload);
    } else {
        store.commit('CLEAR_PENDING_CANCELLATIONS');
    }

    window.localStorage.setItem(
        'pendingCancellations',
        JSON.stringify(store.state.history.pendingCancellations)
    );
};

export const cancelEntry = (store, payload) => {
    payload.transactionIds = store.state.history.history.find(
        entry => entry.localId === payload.localId
    ).transactionIds;

    if (!payload.transactionIds) {
        store.commit('ADD_PENDING_CANCELLATION', payload);
    } else {
        // request made online

        const cancelPurchases = payload.transactionIds.purchases.map(id => ({
            rawType: 'purchase',
            id
        }));

        const cancelReloads = payload.transactionIds.reloads.map(id => ({
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

            cancelPurchases.concat(cancelReloads).map(body =>
                store.dispatch('addPendingRequest', {
                    url: cancelUrl,
                    body
                })
            );

            return Promise.resolve();
        }
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
            Promise.all(bodys.map(body => axios.post(cancelUrl, body, store.getters.tokenHeaders)))
        );

    return Promise.all(cancellations).then(() => {
        store.state.history.pendingCancellations
            .filter(pending => pending.transactionIds)
            .forEach(pending => {
                store.commit('REMOVE_PENDING_CANCELLATION', pending);
            });
    });
};
