import axios from '@/utils/axios';
import cloneDeep from 'lodash.clonedeep';
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

    const initialPromise = !getters.isDegradedModeActive
        ? axios.post(`${config.api}/services/login`, credentials)
        : offlineLogin(state.online.offline.sellers, credentials);

    return initialPromise
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

            commit('ID_SELLER', '');
            commit('SET_DATA_LOADED', null);

            if (err.message === 'Network Error') {
                commit('ERROR', { message: 'Server not reacheable' });
                return;
            }

            commit('ERROR', err.response.data);
        });
};

export const logout = store => {
    if (store.state.auth.buyer.isAuth) {
        store.commit('LOGOUT_BUYER');
        return store.dispatch('clearBasket').then(() => store.dispatch('interfaceLoader'));
    } else if (store.state.auth.seller.isAuth) {
        store.commit('FIRST_LOGOUT_SELLER');
    } else {
        return store.dispatch('pursueLogout');
    }

    return Promise.resolve();
};

export const pursueLogout = ({ commit, dispatch }) => {
    commit('LOGOUT_SELLER');
    commit('ID_SELLER', '');
    // Remove disconnect warning
    commit('REMOVE_LOGOUT_WARNING');

    return dispatch('clearBasket')
        .then(() => dispatch('updateEssentials', true))
        .then(() => dispatch('clearInterface'))
        .then(() => dispatch('setupSocket'));
};

export const cancelLogout = ({ commit }) => {
    commit('REMOVE_LOGOUT_WARNING');
};

export const buyer = (store, { cardNumber, credit, options, isOnlyAuth }) => {
    const token = store.getters.tokenHeaders;
    const onlyAuth = isOnlyAuth || false;

    let cardCredit = credit;

    store.commit('SET_DATA_LOADED', false);

    let initialPromise = Promise.resolve();

    if (store.state.auth.seller.canAssign) {
        store.commit('SET_DATA_LOADED', true);
        return;
    }

    let interfaceLoaderCredentials;
    let shouldSendBasket = false;
    let shouldWriteCredit = false;
    let shouldClearBasket = false;
    let shouldCheckPending = false;
    let shouldChangeBuyer = false;

    if (!store.state.auth.device.config.doubleValidation) {
        // First time: sendBasket will active "WAITING_FOR_BUYER" and return
        shouldSendBasket = !onlyAuth;
        shouldClearBasket = store.getters.isSellerMode;

        if (store.state.basket.basketStatus === 'WAITING_FOR_BUYER') {
            shouldChangeBuyer = true;
            shouldCheckPending =
                store.state.online.status &&
                options.assignedCard &&
                store.state.basket.pendingCardUpdates.indexOf(cardNumber) > -1;
            shouldWriteCredit = store.state.auth.device.event.config.useCardData;
        } else {
            interfaceLoaderCredentials = { type: config.buyerMeanOfLogin, mol: cardNumber, credit };
        }
    } else {
        if (store.state.auth.buyer.isAuth) {
            shouldSendBasket = true;
            shouldClearBasket = true;
            shouldChangeBuyer = true;
        } else {
            shouldCheckPending =
                store.state.online.status &&
                options.assignedCard &&
                store.state.basket.pendingCardUpdates.indexOf(cardNumber) > -1;
            interfaceLoaderCredentials = { type: config.buyerMeanOfLogin, mol: cardNumber, credit };
        }
    }

    if (shouldCheckPending) {
        const pendingUrl = `${config.api}/services/pendingCardUpdate?molType=${
            config.buyerMeanOfLogin
        }&buyer=${cardNumber}`;

        initialPromise = initialPromise
            .then(() => axios.get(pendingUrl, store.getters.tokenHeaders))
            .catch(() => Promise.resolve({ data: { amount: 0 } }))
            .then(res => {
                cardCredit += res.data.amount;
                return store.dispatch('removePendingCardUpdate', cardNumber);
            });
    }

    if (shouldSendBasket) {
        initialPromise = initialPromise.then(() => {
            if (typeof cardCredit === 'number') {
                store.commit('OVERRIDE_BUYER_CREDIT', cardCredit);
            }
            return store.dispatch('sendBasket', { cardNumber, assignedCard: options.assignedCard });
        });
    } else {
        initialPromise = initialPromise.then(() => store.commit('SET_BUYER_MOL', cardNumber));
    }

    if (shouldWriteCredit) {
        options.assignedCard = true;
        initialPromise = initialPromise.then(
            () =>
                new Promise(resolve => {
                    window.app.$root.$emit('readyToWrite', store.state.ui.lastUser.credit, options);
                    window.app.$root.$on('writeCompleted', () => resolve());
                })
        );
    }

    if (shouldClearBasket) {
        initialPromise = initialPromise.then(() => store.dispatch('clearBasket'));
    }

    initialPromise = initialPromise
        .then(() => store.dispatch('interfaceLoader', interfaceLoaderCredentials))
        .then(() => {
            if (
                typeof cardCredit === 'number' &&
                store.state.auth.device.event.config.useCardData
            ) {
                store.commit('OVERRIDE_BUYER_CREDIT', cardCredit);
            }

            if (shouldChangeBuyer) {
                store.commit('OPEN_TICKET');
                store.commit('LOGOUT_BUYER');
            }
        })
        .catch(err => {
            console.log(err);

            if (err.message === 'Network Error') {
                store.commit('ERROR', { message: 'Server not reacheable' });
                return;
            }

            store.commit('ERROR', err.response.data);
        })
        .then(() => {
            store.commit('SET_DATA_LOADED', true);
            store.commit('SET_WRITING', false);
        });

    return initialPromise;
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
