import q from '../../utils/q';
import offlineLogin from '../../utils/offline/login';

export const setPoint = ({ commit }, payload) => {
    commit('SET_DEVICE', payload);
};

export const setGiftReloads = ({ commit }, payload) => {
    commit('SET_GIFTRELOADS', payload);
};

export const setNfcCosts = ({ commit }, payload) => {
    commit('SET_NFCCOSTS', payload);
};

export const setFullDevice = ({ commit }, payload) => {
    commit('SET_FULL_DEVICE', payload);
};

export const setEvent = ({ commit }, payload) => {
    commit('SET_EVENT', payload);
};

export const setGroups = ({ commit }, payload) => {
    commit('SET_GROUPS', payload);
};

export const login = ({ commit, dispatch, state, getters }, { meanOfLogin, password }) => {
    commit('SET_DATA_LOADED', false);
    const credentials = {
        meanOfLogin: config.loginMeanOfLogin,
        data: meanOfLogin,
        pin: password
    };

    dispatch('sendRequest', {
        method: 'post',
        url: 'services/login',
        data: credentials,
        offlineAnswer: offlineLogin(state.online.offline.sellers, credentials),
        noQueue: true
    })
        .then(res => {
            if (
                !res.data.user.canSell &&
                !res.data.user.canReload &&
                !res.data.user.canAssign &&
                !res.data.user.canControl
            ) {
                return Promise.reject({ response: { data: { message: 'Not enough rights' } } });
            }

            commit('AUTH_SELLER', {
                id: res.data.user.id,
                meanOfLogin,
                pin: password,
                token: res.data.token,
                firstname: res.data.user.firstname,
                lastname: res.data.user.lastname,
                canSell: res.data.user.canSell,
                canReload: res.data.user.canReload,
                canAssign: res.data.user.canAssign,
                canControl: res.data.user.canControl
            });

            return dispatch('updateEssentials', true).then(() => dispatch('interfaceLoader'));
        })
        .then(() => dispatch('setupSocket', state.auth.seller.token))
        .then(() => commit('SET_DATA_LOADED', true))
        .catch(err => {
            console.error(err);

            dispatch('pursueLogout');
            commit('SET_DATA_LOADED', true);

            if (err.message === 'Network Error') {
                commit('ERROR', { message: 'Server not reacheable' });
                return;
            }

            commit('ERROR', err.response.data);
        });
};

export const logoutBuyer = store => {
    if (store.state.auth.buyer.isAuth) {
        store.commit('LOGOUT_BUYER');

        return store.dispatch('clearBasket').then(() => store.dispatch('interfaceLoader'));
    }

    return Promise.resolve();
};

export const pursueLogout = ({ commit, dispatch }) => {
    commit('LOGOUT_SELLER');
    commit('ID_SELLER', '');
    // Remove disconnect warning
    commit('REMOVE_LOGOUT_WARNING');

    return dispatch('logoutBuyer')
        .then(() => dispatch('clearBasket'))
        .then(() => dispatch('updateEssentials', true))
        .then(() => dispatch('clearInterface'))
        .then(() => dispatch('setupSocket'));
};

export const cancelLogout = ({ commit }) => {
    commit('REMOVE_LOGOUT_WARNING');
};

export const buyer = (store, { cardNumber, credit }) => {
    store.commit('SET_DATA_LOADED', false);

    let initialPromise = Promise.resolve();
    if (store.state.auth.device.config.doubleValidation) {
        initialPromise = initialPromise.then(() =>
            store.dispatch('checkPendingCardUpdates', { cardNumber })
        );
    }

    initialPromise
        .then(() =>
            store.dispatch('interfaceLoader', {
                type: config.buyerMeanOfLogin,
                mol: cardNumber,
                credit
            })
        )
        .catch(err => {
            console.log(err);

            if (err.message === 'Network Error') {
                store.commit('ERROR', { message: 'Server not reacheable' });
                return;
            }

            store.commit('ERROR', err.response.data);
        })
        .then(() => {
            store.commit('EMPTY_TICKET');
            store.commit('SET_DATA_LOADED', true);
        });
};

export const sellerId = ({ commit }, meanOfLogin) => {
    commit('ID_SELLER', meanOfLogin);
};

export const alert = ({ commit }, alert) => {
    commit('ALERT', alert);
};

export const closeAlert = ({ commit }) => {
    commit('CLOSE_ALERT');
};
