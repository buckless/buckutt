export const loadDefaultItems = store => {
    const defaultItems = store.state.online.offline.defaultItems;
    store.commit('SET_ITEMS', defaultItems.articles || []);
    store.commit('SET_PROMOTIONS', defaultItems.promotions || []);

    store.dispatch('setWiketItems').then(() => {
        if (store.getters.tabs.length > 0) {
            store.commit('CHANGE_TAB', store.getters.tabs[0].id);
        }
    });
};

export const clearInterface = store => {
    store.commit('CLEAR_ITEMS');
    store.commit('CLEAR_PROMOTIONS');
};

export const setWiketItems = ({ state, commit }) => {
    const defaultItems = state.items.items;
    const defaultPromotions = state.items.promotions;
    let groupsToKeep = [
        state.auth.device.event.defaultGroup_id,
        state.auth.device.wiket.defaultGroup_id
    ];

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
            .filter(item => item.price.amount >= 0)
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
