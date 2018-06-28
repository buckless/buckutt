export const setPendingCardUpdates = ({ commit }, payload) => {
    commit('SET_PENDINGCARDUPDATES', payload);
};

export const removePendingCardUpdate = ({ commit }, cardId) => {
    commit('REMOVE_PENDINGCARDUPDATE', cardId);
};

export const addItemToBasket = ({ commit, dispatch }, item) => {
    commit('ADD_ITEM', item);
};

export const removeItemFromBasket = ({ commit, dispatch }, item) => {
    commit('REMOVE_ITEM', item);
};

export const clearBasket = ({ commit }) => {
    commit('CLEAR_BASKET');
    commit('REMOVE_RELOADS');
};

export const checkBuyerCredit = store => {
    if (store.state.auth.device.event.config.useCardData) {
        const minReload = store.state.auth.device.event.config.minReload;
        const maxPerAccount = store.state.auth.device.event.config.maxPerAccount;
        if (store.getters.credit < 0) {
            return Promise.reject({ response: { data: { message: 'Not enough credit' } } });
        } else if (store.getters.credit > maxPerAccount && store.getters.reloadAmount > 0) {
            const max = (maxPerAccount / 100).toFixed(2);
            return Promise.reject({
                response: { data: { message: `Maximum exceeded : ${max}€` } }
            });
        } else if (store.getters.reloadAmount > 0 && store.getters.reloadAmount < minReload) {
            const min = (minReload / 100).toFixed(2);
            return Promise.reject({
                response: { data: { message: `Can not reload less than : ${min}€` } }
            });
        }
    }

    return Promise.resolve();
};

export const checkPendingCardUpdates = (store, { cardNumber }) => {
    const pendingUrl = `services/pendingCardUpdate?molType=${
        config.buyerMeanOfLogin
    }&buyer=${cardNumber}`;

    return store
        .dispatch('sendRequest', {
            url: pendingUrl,
            noQueue: true,
            offlineAnswer: { fake: true }
        })
        .then(res => {
            if (res.fake) {
                return Promise.resolve();
            }
            store.commit('OVERRIDE_BUYER_CREDIT', store.state.auth.buyer.credit + res.data.amount);
            return store.dispatch('removePendingCardUpdate', cardNumber);
        });
};

export const addNfcSupportToBasket = store => {
    const now = new Date();
    const currentBuyerGroups = store.state.auth.buyer.memberships
        .filter(membership => new Date(membership.start) <= now && new Date(membership.end) >= now)
        .map(membership => ({ id: membership.group }));

    const validCosts = store.state.items.nfcCosts
        .filter(
            nfcCost =>
                new Date(nfcCost.start) <= now &&
                new Date(nfcCost.end) >= now &&
                currentBuyerGroups.find(group => group.id === nfcCost.group)
        )
        .sort((a, b) => a.amount - b.amount);

    if (validCosts.length > 0) {
        store.dispatch('addItemToBasket', {
            price: validCosts[0],
            id: store.state.auth.device.event.nfc_id,
            vat: 0.2,
            alcohol: 0,
            name: 'Support NFC'
        });

        store.commit('SET_LAST_USER_CARD_PAID', validCosts[0].amount);
    }
};

export const validateBasket = (store, { cardNumber, credit, options }) => {
    if (
        store.state.basket.basketStatus === 'DOING' ||
        (store.getters.reloadAmount === 0 && store.getters.basketAmount === 0)
    ) {
        return;
    }

    store.commit('SET_DATA_LOADED', false);

    let initialPromise = Promise.resolve();

    // Offline interfaceLoader to update user prices
    initialPromise = store.dispatch('interfaceLoader', {
        type: config.buyerMeanOfLogin,
        mol: cardNumber,
        credit,
        forceOffline: true
    });

    const shouldPayCard = !options.paidCard && store.state.auth.device.event.config.useCardData;

    if (shouldPayCard) {
        initialPromise = initialPromise.then(() => store.dispatch('addNfcSupportToBasket'));
    }

    const shouldCheckPending =
        options.assignedCard &&
        store.state.basket.pendingCardUpdates.indexOf(cardNumber) > -1 &&
        store.state.auth.device.event.config.useCardData;

    if (shouldCheckPending) {
        initialPromise = initialPromise.then(() =>
            store.dispatch('checkPendingCardUpdates', { cardNumber })
        );
    }

    initialPromise = initialPromise.then(() => store.dispatch('checkBuyerCredit'));

    if (store.state.auth.device.event.config.useCardData) {
        const newOptions = {
            assignedCard: true,
            paidCard: true,
            catering: options.catering
        };

        initialPromise = initialPromise.then(
            () =>
                new Promise(resolve => {
                    window.app.$root.$emit('readyToWrite', store.getters.credit, newOptions);
                    window.app.$root.$on('writeCompleted', () => resolve());
                })
        );
    }

    return initialPromise
        .then(() =>
            store.dispatch('sendBasket', { cardNumber, assignedCard: options.assignedCard })
        )
        .then(() => {
            store.commit('LOGOUT_BUYER');
            store.commit('SET_BASKET_STATUS', 'WAITING');
            store.dispatch('clearBasket');
            store.dispatch('interfaceLoader');
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
            return store.dispatch('removeItemFromBasket', {
                id: store.state.auth.device.event.nfc_id
            });
        });
};

export const sendBasket = (store, payload = {}) => {
    const now = payload.now || new Date();
    const cardNumber = payload.cardNumber || store.state.auth.buyer.meanOfLogin;

    store.commit('SET_BASKET_STATUS', 'DOING');

    const basket = store.getters.sidebar;
    const reloads = store.state.reload.reloads;

    const basketToSend = [];

    console.log(basket.items);

    basket.items.forEach(article => {
        basketToSend.push({
            price_id: article.price.id,
            promotion_id: null,
            name: article.name,
            articles: [
                {
                    id: article.id,
                    vat: article.vat,
                    price: article.price.id
                }
            ],
            alcohol: article.alcohol,
            cost: article.price.amount,
            type: 'purchase'
        });
    });

    basket.promotions.forEach(promotion => {
        const articlesInside = [];
        let alcohol = 0;

        promotion.content.forEach(articleInside => {
            articlesInside.push({
                id: articleInside.id,
                vat: articleInside.vat,
                price: articleInside.price.id
            });

            alcohol += articleInside.alcohol;
        });

        basketToSend.push({
            price_id: promotion.price.id,
            promotion_id: promotion.id,
            name: promotion.name,
            articles: articlesInside,
            cost: promotion.price.amount,
            type: 'purchase',
            alcohol
        });
    });

    reloads.forEach(reload => {
        basketToSend.push({
            credit: reload.amount,
            trace: reload.trace,
            type: reload.type
        });
    });

    const localId = `transaction-id-${window.appId}-${Date.now()}`;
    const transactionToSend = {
        assignedCard: payload.assignedCard,
        buyer: cardNumber,
        molType: config.buyerMeanOfLogin,
        date: now,
        basket: basketToSend,
        seller: store.state.auth.seller.id,
        localId
    };

    return store
        .dispatch('sendRequest', {
            method: 'post',
            url: 'services/basket',
            data: transactionToSend,
            offlineAnswer: {
                data: {
                    transactionIds: null,
                    credit: store.getters.credit,
                    firstname: store.state.auth.buyer.firstname,
                    lastname: store.state.auth.buyer.lastname
                }
            }
        })
        .then(lastBuyer => {
            store.commit('SET_LAST_USER', {
                display: true,
                name: lastBuyer.data.firstname
                    ? `${lastBuyer.data.firstname} ${lastBuyer.data.lastname}`
                    : null,
                credit: lastBuyer.data.credit,
                reload: store.getters.reloadAmount,
                bought: store.getters.basketAmount,
                localId
            });

            // store last lastBuyer + transactionIds
            return store.dispatch('addToHistory', {
                cardNumber,
                basketToSend,
                date: new Date(),
                transactionIds: lastBuyer.data.transactionIds,
                localId
            });
        });
};

export const basketClickValidation = store => {
    if (!store.state.auth.device.config.doubleValidation) {
        store.commit('SET_WRITING', true);
        store.commit('SET_BASKET_STATUS', 'WAITING_FOR_BUYER');
        return;
    }

    return store.dispatch('validateBasket', {
        cardNumber: store.state.auth.buyer.meanOfLogin,
        credit: store.state.auth.buyer.credit,
        options: {
            assignedCard: true
        }
    });
};
