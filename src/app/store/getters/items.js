import uniqBy from 'lodash.uniqby';
import isMobile from '../../utils/isMobile';

export const wiketItems = state => {
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
                            (object1.category.id === object2.category.id || !object1.category)
                    )
            )
    );

    console.log(res[0]);

    const promotions = res[1].map(promotion => {
        promotion.sets = promotion.sets.map(set => {
            set.articles = set.articles
                .map(article => res[0].find(a => a.id === article.id))
                .filter(article => article);
            return set;
        });
    });

    return { items: res[0], promotions };
};

export const tabs = (_, getters) => {
    let tabs = getters.wiketItems.items
        .map(item => item.category)
        .sort((a, b) => b.priority - a.priority);

    // Reverse sort
    return uniqBy(tabs, 'name');
};

export const tabItems = (state, getters) =>
    // flatten all tabs on mobile
    getters.wiketItems.items
        .filter(item => item.category.id === state.ui.currentTabId || isMobile())
        .sort((a, b) => a.name.localeCompare(b.name));

export const basketAmount = state => {
    const basket = state.items.basket.sidebar;

    if (!basket.items && !basket.promotions) {
        return 0;
    }

    const items = (basket.items || []).map(item => item.price.amount).reduce((a, b) => a + b, 0);

    const promotions = (basket.promotions || [])
        .map(promotion => promotion.price.amount)
        .reduce((a, b) => a + b, 0);

    return items + promotions;
};

export const reloadAmount = state => {
    return state.reload.reloads.map(reload => reload.amount).reduce((a, b) => a + b, 0);
};

export const credit = state => {
    const initialCredit = state.auth.buyer.credit;
    const reloads = reloadAmount(state);
    const basketCost = basketAmount(state);

    return initialCredit + reloads - basketCost;
};
