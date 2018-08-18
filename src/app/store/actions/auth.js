import q from '../../utils/q';
import offlineLogin from '../../utils/offline/login';

export const setDevice = ({ commit }, payload) => {
    commit('SET_DEVICE', payload);
};

export const setWiket = ({ commit }, payload) => {
    commit('SET_WIKET', payload);
};

export const setGiftReloads = ({ commit }, payload) => {
    commit('SET_GIFTRELOADS', payload);
};

export const setNfcCosts = ({ commit }, payload) => {
    commit('SET_NFCCOSTS', payload);
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

    return dispatch('sendRequest', {
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

            return dispatch('updateEssentials')
                .then(() => dispatch('updateStoredItems'))
                .then(() => dispatch('loadDefaultItems'));
        })
        .then(() => {
            console.log('setup socket');
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

        return store.dispatch('clearBasket').then(() => store.dispatch('loadDefaultItems'));
    }

    return Promise.resolve();
};

export const pursueLogout = ({ commit, dispatch }) => {
    commit('LOGOUT_SELLER');
    commit('UPDATE_TOKEN', '');
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

export const buyerLogin = (store, { cardNumber, credit, removeUnavailable }) => {
    const doubleValidation = store.state.auth.device.config.doubleValidation;

    // if double validation, then a user2 can't eject/replace user1
    if (doubleValidation && store.state.auth.buyer.isAuth) {
        return;
    }

    store.commit('SET_DATA_LOADED', false);

    const params = `?buyer=${cardNumber.trim()}&molType=${config.buyerMeanOfLogin}`;
    const offlineAnswer = window.database.cardAccesses(cardNumber.trim()).then(memberships => ({
        data: {
            buyer: {
                firstname: 'Client',
                lastname: 'Anonyme',
                credit,
                memberships: memberships
                    .concat([
                        {
                            groupId: store.state.auth.device.event.defaultGroup_id,
                            start: new Date(0),
                            end: new Date(21474000000000)
                        }
                    ])
                    .map(membership => ({
                        group_id: membership.groupId,
                        period: {
                            start: membership.start,
                            end: membership.end
                        }
                    }))
            }
        }
    }));

    return store
        .dispatch('updateEssentials')
        .then(() =>
            store.dispatch('sendRequest', {
                url: `/services/buyer${params}`,
                offlineAnswer,
                noQueue: true,
                // If use card data, always use local data
                forceOffline: store.state.auth.device.event.config.useCardData
            })
        )
        .then(res => {
            const memberships = res.data.buyer.memberships.map(membership => ({
                start: membership.period.start,
                end: membership.period.end,
                group: membership.group_id
            }));

            const buyerCredit = typeof credit === 'number' ? credit : res.data.buyer.credit;

            store.commit('ID_BUYER', {
                id: res.data.buyer.id || '',
                credit: buyerCredit,
                firstname: res.data.buyer.firstname || '',
                lastname: res.data.buyer.lastname || '',
                memberships,
                purchases: res.data.buyer.purchases || []
            });
            store.commit('SET_BUYER_MOL', cardNumber.trim());
        })
        .catch(err => {
            if (err.message === 'Network Error') {
                store.commit('ERROR', { message: 'Server not reacheable' });
                return;
            }

            if (
                err.response.data &&
                err.response.data.message === 'Buyer not found' &&
                store.state.auth.device.event.config.useCardData &&
                typeof credit === 'number'
            ) {
                store.commit('ID_BUYER', {
                    id: '',
                    credit,
                    firstname: '',
                    lastname: '',
                    memberships: [],
                    purchases: []
                });
                store.commit('SET_BUYER_MOL', payload.mol.trim());
                return;
            }

            store.commit('ERROR', err.response.data);
        })
        .then(() => {
            // Update default items if the basket is empty, else, only update prices
            if (store.state.items.basket.itemList.length === 0) {
                return store.dispatch('loadDefaultItems');
            }

            return store.dispatch('setWiketItems');
        })
        .then(() => {
            // Only remove unavailable items if it's not a basket validation
            if (removeUnavailable) {
                return store.dispatch('removeUnavailableItemsFromBasket');
            }
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
    commit('SET_ALERT', alert);
};

export const closeAlert = ({ commit }) => {
    commit('CLOSE_ALERT');
};
