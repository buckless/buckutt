import offlineLogin from '../../utils/offline/login';

export const setDevice = ({ commit }, payload) => {
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

export const login = ({ commit, dispatch, state }, { wallet, pin }) => {
    commit('SET_DATA_LOADED', false);
    const credentials = { wallet, pin };

    return dispatch('sendRequest', {
        method: 'post',
        url: 'auth/login',
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
                return Promise.reject({
                    response: { data: { message: 'Not enough rights' } }
                });
            }

            commit('AUTH_SELLER', {
                id: res.data.user.id,
                pin,
                token: res.data.token,
                firstname: res.data.user.firstname,
                lastname: res.data.user.lastname,
                canSell: res.data.user.canSell,
                canReload: res.data.user.canReload,
                canAssign: res.data.user.canAssign,
                canControl: res.data.user.canControl
            });
            return dispatch('setupClient');
        })
        .then(() => dispatch('loadDefaultItems'))
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
    if (store.getters.buyerLogged) {
        store.commit('LOGOUT_BUYER');

        return store.dispatch('clearBasket').then(() => store.dispatch('loadDefaultItems'));
    }
};

export const pursueLogout = ({ commit, dispatch }) => {
    commit('LOGOUT_SELLER');
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

export const fetchPendingCardUpdates = (store, { cardNumber, version }) => {
    if (!store.state.auth.device.event.config.useCardData) {
        return { amount: 0, version, ids: [] };
    }

    return window.database.pendingCardUpdates(cardNumber.trim()).then(pendingCardUpdates => {
        const pendingUpdates = pendingCardUpdates
            .filter(pcu => pcu.incrId > version)
            .sort((a, b) => a.incrId - b.incrId);

        if (pendingUpdates.length === 0) {
            return { amount: 0, version, ids: [] };
        }

        const updatedVersion = parseInt(pendingUpdates[pendingUpdates.length - 1].incrId, 10);
        const amount = pendingUpdates.map(pcu => pcu.amount).reduce((a, b) => a + b, 0);
        const ids = pendingUpdates.map(pcu => pcu.id);

        return {
            amount,
            version: updatedVersion,
            ids
        };
    });
};

export const fetchUser = (store, { cardNumber, credit }) => {
    const params = `?walletId=${cardNumber.trim()}`;
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

    return store.dispatch('sendRequest', {
        url: `customer/buyer${params}`,
        offlineAnswer,
        noQueue: true,
        // If use card data, always use local data
        forceOffline: store.state.auth.device.event.config.useCardData
    });
};

export const buyerLogin = async (
    store,
    { cardNumber, credit, options, version, removeUnavailable }
) => {
    const doubleValidation = store.state.auth.device.config.doubleValidation;

    // if double validation, then a user2 can't eject/replace user1
    if (doubleValidation && store.getters.buyerLogged) {
        return;
    }

    store.commit('SET_DATA_LOADED', false);

    try {
        const [user, pendingCardUpdates] = await Promise.all([
            store.dispatch('fetchUser', { cardNumber, credit }),
            store.dispatch('fetchPendingCardUpdates', { cardNumber, credit, version })
        ]);

        const memberships = user.data.buyer.memberships.map(membership => ({
            start: membership.period.start,
            end: membership.period.end,
            group: membership.group_id
        }));

        store.commit('AUTH_BUYER', {
            id: user.data.buyer.id || '',
            credit: user.data.buyer.credit + pendingCardUpdates.amount,
            firstname: user.data.buyer.firstname || '',
            lastname: user.data.buyer.lastname || '',
            memberships,
            purchases: user.data.buyer.purchases || [],
            catering: options ? options.catering : [],
            pendingData: {
                version: pendingCardUpdates.version,
                ids: pendingCardUpdates.ids
            }
        });
        store.commit('SET_BUYER_WALLET', cardNumber.trim());
    } catch (err) {
        if (err.message === 'Network Error') {
            store.commit('ERROR', { message: 'Server not reacheable' });
            throw Error(err);
        }

        store.commit('ERROR', err.response.data);
    }

    // Update default items if the basket is empty, else, only update prices
    if (store.state.items.basket.itemList.length === 0) {
        await store.dispatch('loadDefaultItems');
    } else {
        await store.dispatch('setWiketItems');
    }

    if (removeUnavailable) {
        await store.dispatch('removeUnavailableItemsFromBasket');
    }

    store.commit('EMPTY_TICKET');
    store.commit('SET_DATA_LOADED', true);
};

export const setSellerWallet = ({ commit }, wallet) => {
    commit('SET_SELLER_WALLET', wallet);
};

export const alert = ({ commit }, alert) => {
    commit('SET_ALERT', alert);
};

export const closeAlert = ({ commit }) => {
    commit('CLOSE_ALERT');
};
