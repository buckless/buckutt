export const setPendingCardUpdates = ({ commit }, payload) => {
    commit('SET_PENDINGCARDUPDATES', payload);
};

export const removePendingCardUpdate = ({ commit }, cardId) => {
    commit('REMOVE_PENDINGCARDUPDATE', cardId);
};

export const addItemToBasket = ({ commit }, item) => {
    commit('ADD_ITEM', item);
};

export const removeItemFromBasket = ({ commit }, item) => {
    commit('REMOVE_ITEM', item);
};

export const clearBasket = ({ commit }) => {
    commit('CLEAR_BASKET');
    commit('REMOVE_RELOADS');
};

export const sendBasket = (store, payload = {}) => {
    // avoid sending multiple requests
    if (store.state.basket.basketStatus === 'DOING') {
        return;
    }

    const bought = store.getters.basketAmount;
    const reloaded = store.getters.reloadAmount;

    if (bought === 0 && reloaded === 0) {
        return;
    }

    // quick mode = wait for card for writing
    if (!store.state.auth.device.config.doubleValidation) {
        if (store.state.basket.basketStatus !== 'WAITING_FOR_BUYER') {
            store.commit('SET_WRITING', true);
            store.commit('SET_BASKET_STATUS', 'WAITING_FOR_BUYER');
            if (payload.cardNumber) {
                store.commit('SET_BUYER_MOL', payload.cardNumber);
            }
            return;
        }
    }

    // no buyer = can't send request
    if (!store.state.auth.buyer.isAuth && !payload.cardNumber) {
        return;
    }

    // !useCardData = checked by the API
    if (store.state.auth.device.event.config.useCardData) {
        const minReload = store.state.auth.device.event.config.minReload;
        const maxPerAccount = store.state.auth.device.event.config.maxPerAccount;
        if (store.getters.credit < 0) {
            return Promise.reject({ response: { data: { message: 'Not enough credit' } } });
        } else if (store.getters.credit > maxPerAccount && reloaded > 0) {
            const max = (maxPerAccount / 100).toFixed(2);
            return Promise.reject({
                response: { data: { message: `Maximum exceeded : ${max}€` } }
            });
        } else if (reloaded > 0 && reloaded < minReload) {
            const min = (minReload / 100).toFixed(2);
            return Promise.reject({
                response: { data: { message: `Can not reload less than : ${min}€` } }
            });
        }
    }

    const now = payload.now || new Date();
    const cardNumber = payload.cardNumber || store.state.auth.buyer.meanOfLogin;

    store.commit('SET_BASKET_STATUS', 'DOING');

    const basket = store.state.items.basket.sidebar;
    const reloads = store.state.reload.reloads;

    const basketToSend = [];

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

    store
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
        .catch(err => {
            // Catch used if !useCardData
            console.log(err);
            store.commit('SET_BASKET_STATUS', 'ERROR');

            if (err.message === 'Network Error') {
                store.commit('ERROR', { message: 'Server not reacheable' });
            } else {
                store.commit('ERROR', err.response.data);
            }

            return Promise.reject(err);
        })
        .then(lastBuyer => {
            // store last lastBuyer + transactionIds
            store.dispatch('addToHistory', {
                cardNumber,
                basketToSend,
                date: new Date(),
                transactionIds: lastBuyer.data.transactionIds,
                localId
            });

            store.commit('ID_BUYER', {
                id: lastBuyer.data.id,
                credit: lastBuyer.data.credit,
                firstname: lastBuyer.data.firstname,
                lastname: lastBuyer.data.lastname
            });
            store.dispatch('clearBasket');
            store.commit('SET_BASKET_STATUS', 'WAITING');
            store.commit('SET_LAST_USER', {
                display: false,
                name: store.state.auth.buyer.firstname
                    ? `${store.state.auth.buyer.firstname} ${store.state.auth.buyer.lastname}`
                    : null,
                credit: store.state.auth.buyer.credit,
                reload: reloaded,
                bought,
                localId
            });

            if (store.state.auth.device.config.doubleValidation) {
                store.commit('LOGOUT_BUYER');
            }
        });
};
