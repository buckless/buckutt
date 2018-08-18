import { uniqBy } from "lodash/array";
import isMobile from "../../utils/isMobile";
import computePromotions from "../../utils/promotions";

export const wiketItems = state => state.items.wiketItems;

export const tabs = (_, getters) => {
    let tabs = getters.wiketItems.items
        .map(item => item.category)
        .sort((a, b) => b.priority - a.priority);

    // Reverse sort
    return uniqBy(tabs, "name");
};

export const tabItems = (state, getters) =>
    // flatten all tabs on mobile
    getters.wiketItems.items
        .filter(
            item => item.category.id === state.ui.currentTabId || isMobile()
        )
        .sort((a, b) => a.name.localeCompare(b.name));

export const basketAmount = (_, getters) => {
    const basket = getters.sidebar;

    if (!basket.items && !basket.promotions) {
        return 0;
    }

    const items = (basket.items || [])
        .map(item => item.price.amount)
        .reduce((a, b) => a + b, 0);

    const promotions = (basket.promotions || [])
        .map(promotion => promotion.price.amount)
        .reduce((a, b) => a + b, 0);

    return items + promotions;
};

export const reloadAmount = state => {
    return state.reload.reloads
        .map(reload => reload.amount)
        .reduce((a, b) => a + b, 0);
};

export const credit = (state, getters) => {
    const initialCredit = state.auth.buyer.credit;
    const reloads = getters.reloadAmount;
    const basketCost = getters.basketAmount;

    return initialCredit + reloads - basketCost;
};

export const sidebar = (state, getters) => {
    const initialSidebar = computePromotions(
        state.items.basket.itemList.slice(),
        getters.wiketItems.promotions.slice()
    );

    const items = initialSidebar.items.map(item => {
        let updatedItem = getters.wiketItems.items.find(i => i.id === item.id);
        if (!updatedItem && state.auth.device.event.nfc_id === item.id) {
            updatedItem = item;
        }

        return {
            ...updatedItem,
            price: updatedItem ? updatedItem.price : item.price
        };
    });

    const promotions = initialSidebar.promotions.map(promotion => {
        const updatedPromotion = getters.wiketItems.promotions.find(
            p => p.id === promotion.id
        );

        return {
            ...updatedPromotion,
            content: promotion.content,
            price: updatedPromotion ? updatedPromotion.price : promotion.price
        };
    });

    return { items, promotions };
};
