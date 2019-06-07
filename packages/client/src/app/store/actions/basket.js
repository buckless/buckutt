export const addItemToBasket = ({ commit }, item) => {
    commit('ADD_ITEM', item);
};

export const removeItemFromBasket = ({ commit }, item) => {
    commit('REMOVE_ITEM', item);
};

export const clearBasket = ({ commit }) => {
    commit('CLEAR_BASKET');
    commit('REMOVE_RELOADS');
    commit('REMOVE_REFUNDS');
};

export const freePriceMode = ({ commit }) => {
    commit('SWITCH_FREE_PRICE_MODE');
};

export const removeUnavailableItemsFromBasket = store => {
    const removals = store.getters.sidebar.catering
        .concat(store.getters.sidebar.items)
        .filter(item => item.price.amount < 0)
        .map(item => store.dispatch('removeItemFromBasket', item));

    return Promise.all(removals);
};

export const checkBuyerCredit = store => {
    if (store.state.auth.device.event.config.useCardData) {
        const minReload = store.state.auth.device.event.config.minReload;
        const maxPerAccount = store.state.auth.device.event.config.maxPerAccount;
        if (store.getters.credit < 0) {
            const missingCredit = ((-1 * store.getters.credit) / 100).toFixed(2);
            return Promise.reject({ message: `Not enough credit : missing ${missingCredit}€` });
        } else if (store.getters.credit > maxPerAccount && store.getters.reloadAmount > 0) {
            const max = (maxPerAccount / 100).toFixed(2);
            return Promise.reject({ message: `Maximum exceeded : ${max}€` });
        } else if (store.getters.reloadAmount > 0 && store.getters.reloadAmount < minReload) {
            const min = (minReload / 100).toFixed(2);
            return Promise.reject({ message: `Can not reload less than : ${min}€` });
        }
    }

    return Promise.resolve();
};

export const commitPendingCardUpdates = store =>
    Promise.all(
        store.state.auth.buyer.pendingData.ids.map(id =>
            store.dispatch('sendRequest', {
                method: 'post',
                url: 'customer/pendingCardUpdate',
                data: { id }
            })
        )
    );

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
            alcohol: 0,
            name: 'Support NFC',
            uncancellable: true
        });

        store.commit('SET_LAST_USER_CARD_PAID', validCosts[0].amount);
    }
};

// Don't need to check for promotions: it has been automatically unmatched
export const checkSidebar = store => {
    const itemsToCheck = store.getters.sidebar.catering.concat(store.getters.sidebar.items);

    if (itemsToCheck.some(item => item.price.amount < 0)) {
        const unallowed = itemsToCheck
            .filter(item => item.price.amount < 0)
            .map(item => item.name)
            .filter((item, index, original) => original.indexOf(item) === index);

        store.commit('SET_UNALLOWED_ITEMS_NAMES', unallowed);
        return Promise.reject({ message: 'User unallowed to buy this' });
    }

    return Promise.resolve();
};

export const generateOptions = store => ({
    assignedCard: true,
    paidCard: true,
    catering: store.getters.catering
});

export const validateBasket = async (store, { cardNumber, credit, options, version }) => {
    if (
        store.state.basket.basketStatus === 'DOING' ||
        (store.getters.refundAmount === 0 && store.getters.reloadAmount === 0 && store.state.items.basket.itemList.length === 0)
    ) {
        return;
    }

    store.commit('SET_DATA_LOADED', false);
    store.commit('SET_BASKET_STATUS', 'DOING');

    // Log-in buyer to update user prices
    await store.dispatch('buyerLogin', {
        cardNumber,
        credit,
        options,
        version
    });

    // Check if the newly logged user can buy what's inside its basket
    try {
        await store.dispatch('checkSidebar');
    } catch (err) {
        await store.dispatch('removeUnavailableItemsFromBasket');
        return store.commit('ERROR', err);
    }

    const shouldPayCard = !options.paidCard && store.state.auth.device.event.config.useCardData;

    // If the support hasn't been paid yet, add it to the basket
    if (shouldPayCard) {
        await store.dispatch('addNfcSupportToBasket');
    }

    // Check if the buyer has enough credit
    try {
        await store.dispatch('checkBuyerCredit');
    } catch (err) {
        await store.dispatch('initiateBasket');
        return store.commit('ERROR', err);
    }

    // If we use card data, write new data on it
    if (store.state.auth.device.event.config.useCardData) {
        const newOptions = await store.dispatch('generateOptions');
        const newCardVersion = store.state.auth.buyer.pendingData.version;

        await new Promise(resolve => {
            window.app.$root.$emit(
                'readyToWrite',
                store.getters.credit,
                newOptions,
                newCardVersion
            );
            window.app.$root.$on('writeCompleted', () => resolve());
        });
    }

    try {
        // Send the basket
        await store.dispatch('sendBasket', { cardNumber });
    } catch (err) {
        if (err.message === 'Network Error') {
            return store.commit('ERROR', { message: 'Server not reacheable' });
        }

        store.commit('ERROR', err.response.data);
    }

    await store.dispatch('commitPendingCardUpdates');
    return store.dispatch('initiateBasket');
};

export const initiateBasket = async store => {
    store.commit('LOGOUT_BUYER');
    store.commit('SET_BASKET_STATUS', 'WAITING');
    await store.dispatch('clearBasket');
    await store.dispatch('loadDefaultItems');

    store.commit('SET_DATA_LOADED', true);
    store.commit('SET_WRITING', false);
    return store.dispatch('removeItemFromBasket', {
        id: store.state.auth.device.event.nfc_id
    });
};

export const sendBasket = (store, payload = {}) => {
    const now = payload.now || new Date();
    const cardNumber = payload.cardNumber || store.state.auth.buyer.wallet;

    const basket = store.getters.sidebar;
    const reloads = store.state.reload.reloads;
    const refunds = store.state.reload.refunds;

    const basketToSend = [];

    basket.items.forEach(article => {
        basketToSend.push({
            price_id: article.price.id,
            promotion_id: null,
            name: article.name,
            articles: [
                {
                    id: article.id
                }
            ],
            alcohol: article.alcohol,
            amount: article.amount,
            itemType: 'purchase',
            uncancellable: article.uncancellable
        });
    });

    basket.promotions.forEach(promotion => {
        const articlesInside = [];
        let alcohol = 0;

        promotion.content.forEach(articleInside => {
            articlesInside.push({
                id: articleInside.id
            });

            alcohol += articleInside.alcohol;
        });

        basketToSend.push({
            price_id: promotion.price.id,
            promotion_id: promotion.id,
            name: promotion.name,
            articles: articlesInside,
            amount: promotion.price.amount,
            itemType: 'purchase',
            alcohol
        });
    });

    reloads.forEach(reload => {
        basketToSend.push({
            amount: reload.amount,
            trace: reload.trace,
            type: reload.type,
            itemType: 'reload'
        });
    });

    refunds.forEach(reload => {
        basketToSend.push({
            amount: reload.amount,
            trace: reload.trace,
            type: reload.type,
            itemType: 'refund'
        });
    });

    const localId = `transaction-id-${window.appId}-${Date.now()}`;
    const transactionToSend = {
        walletId: cardNumber,
        date: now,
        basket: basketToSend,
        seller: store.state.auth.seller.id,
        localId
    };

    basket.catering.forEach(cat =>
        store
            .dispatch('sendRequest', {
                method: 'post',
                url: 'payment/catering',
                data: {
                    cateringId: cat.cateringId,
                    name: cat.name,
                    walletId: cardNumber
                }
            })
            .then(() => store.dispatch('incrementCatering', cat.cateringId))
    );

    return store
        .dispatch('sendRequest', {
            method: 'post',
            url: 'payment/basket',
            data: transactionToSend,
            offlineAnswer: {
                data: {
                    credit: store.getters.credit,
                    user: {
                        firstname: store.state.auth.buyer.firstname,
                        lastname: store.state.auth.buyer.lastname
                    }
                }
            }
        })
        .then(lastWallet => {
            store.commit('SET_LAST_USER', {
                display: true,
                name: lastWallet.data.user.firstname
                    ? `${lastWallet.data.user.firstname} ${lastWallet.data.user.lastname}`
                    : null,
                credit: lastWallet.data.credit,
                reload: store.getters.reloadAmount,
                refund: store.getters.refundAmount,
                bought: store.getters.basketAmount,
                localId
            });

            // store last buyer
            return store.dispatch('addToHistory', {
                cardNumber,
                basketToSend,
                date: new Date(),
                localId
            });
        });
};

export const basketClickValidation = store => {
    if (store.getters.refundAmount === 0 && store.getters.reloadAmount === 0 && store.state.items.basket.itemList.length === 0) {
        return;
    }

    if (!store.state.auth.device.config.doubleValidation) {
        store.commit('SET_WRITING', true);
        store.commit('SET_BASKET_STATUS', 'WAITING_FOR_BUYER');
        return;
    }

    return store.dispatch('validateBasket', {
        cardNumber: store.state.auth.buyer.wallet,
        credit: store.state.auth.buyer.credit,
        options: {
            // To fix: store if the card is paid while buyer login
            paidCard: true
        }
    });
};
