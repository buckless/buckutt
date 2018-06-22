export const interfaceLoader = (store, payload = {}) => {
    let params = '';
    let offlineAnswer = { data: store.state.online.offline.defaultItems };

    if (payload.mol) {
        params = `?buyer=${payload.mol.trim()}&molType=${payload.type}`;
        offlineAnswer = window.database.cardAccesses(payload.mol.trim()).then(memberships => ({
            data: {
                ...store.state.online.offline.defaultItems,
                buyer: {
                    credit: payload ? payload.credit : null,
                    memberships: memberships
                        .concat([
                            {
                                group: store.state.auth.device.event.defaultGroup_id,
                                start: new Date(0),
                                end: new Date(21474000000000)
                            }
                        ])
                        .map(membership => ({
                            group_id: membership.group,
                            period: {
                                start: membership.start,
                                end: membership.end
                            }
                        }))
                }
            }
        }));
    }

    return store
        .dispatch('sendRequest', {
            url: `/services/items${params}`,
            offlineAnswer,
            noQueue: true,
            forceOffline: payload.forceOffline
        })
        .then(res => {
            if (payload.mol && res.data.buyer && typeof res.data.buyer.credit === 'number') {
                const memberships = res.data.buyer.memberships.map(membership => ({
                    start: membership.period.start,
                    end: membership.period.end,
                    group: membership.group_id
                }));

                const credit =
                    typeof payload.credit === 'number' ? payload.credit : res.data.buyer.credit;

                store.commit('ID_BUYER', {
                    id: res.data.buyer.id || '',
                    credit,
                    firstname: res.data.buyer.firstname || '',
                    lastname: res.data.buyer.lastname || '',
                    memberships,
                    purchases: res.data.buyer.purchases || []
                });
                store.commit('SET_BUYER_MOL', payload.mol.trim());
            }

            if (!res.data.buyer || !res.data.buyer.id) {
                // This will be call at least once when seller logs in
                // It will stores default items in case of disconnection
                store.dispatch('setDefaultItems', {
                    articles: res.data.articles,
                    promotions: res.data.promotions
                });
            }

            if (res.data.articles) {
                store.commit('SET_ITEMS', res.data.articles);
            }

            if (res.data.promotions) {
                store.commit('SET_PROMOTIONS', res.data.promotions);
            }

            return store.dispatch('setWiketItems');
        })
        .then(() => {
            if (store.getters.tabs.length > 0) {
                store.commit('CHANGE_TAB', store.getters.tabs[0].id);
            }
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
                typeof payload.credit === 'number'
            ) {
                store.commit('ID_BUYER', {
                    id: '',
                    credit: payload.credit,
                    firstname: '',
                    lastname: '',
                    memberships: [],
                    purchases: []
                });
                store.commit('SET_BUYER_MOL', payload.mol.trim());
                return;
            }

            store.commit('ERROR', err.response.data);
        });
};

export const clearInterface = store => {
    store.commit('CLEAR_ITEMS');
    store.commit('CLEAR_PROMOTIONS');
};

export const setWiketItems = ({ state, commit }) => {
    const defaultItems = state.items.items;
    const defaultPromotions = state.items.promotions;
    let groupsToKeep = [state.auth.device.event.defaultGroup_id];

    if (state.auth.buyer.isAuth && state.auth.buyer.memberships) {
        groupsToKeep = state.auth.buyer.memberships
            .filter(m => new Date(m.start) <= Date.now() && new Date(m.end) >= Date.now())
            .map(m => m.group);
    }

    const res = [defaultItems, defaultPromotions].map(defaultObjects =>
        defaultObjects
            // filter items with time and groups
            .filter(
                item =>
                    new Date(item.price.start) <= Date.now() &&
                    new Date(item.price.end) >= Date.now() &&
                    groupsToKeep.indexOf(item.price.group) > -1
            )

            // keep the lowest price (by category) for each object1
            .sort((a, b) => a.price.amount - b.price.amount)
            .filter(
                (object1, i, initialObjects) =>
                    i ===
                    initialObjects.findIndex(
                        object2 =>
                            object1.id === object2.id &&
                            (!object1.category || object1.category.id === object2.category.id)
                    )
            )
    );

    const promotions = res[1].map(promotion => ({
        ...promotion,
        sets: promotion.sets.map(set => ({
            ...set,
            articles: set.articles
                .map(article => res[0].find(a => a.id === article.id))
                .filter(article => article)
        }))
    }));

    return commit('SET_WIKETITEMS', { items: res[0], promotions });
};
