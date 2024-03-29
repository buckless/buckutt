import { uniqBy } from 'lodash/array';
import { groupBy } from 'lodash/collection';
import isMobile from '../../utils/isMobile';
import computePromotions from '../../utils/promotions';
import computeCatering from '../../utils/computeCatering';

export const wiketItems = state => state.items.wiketItems;

export const tabs = (_, getters) => {
    let tabs = getters.wiketItems.items
        .map(item => item.category)
        .sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));

    // Reverse sort
    return uniqBy(tabs, 'name');
};

export const tabItems = (state, getters) =>
    // flatten all tabs on mobile
    getters.wiketItems.items
        .filter(item => item.category.id === state.ui.currentTabId || isMobile())
        .sort((a, b) => a.name.localeCompare(b.name));

export const basketAmount = (_, getters) => {
    const basket = getters.sidebar;

    if (!basket.items && !basket.promotions) {
        return 0;
    }

    const items = (basket.items || []).map(item => item.amount || 0).reduce((a, b) => a + b, 0);

    const promotions = (basket.promotions || [])
        .map(promotion => promotion.price.amount || 0)
        .reduce((a, b) => a + b, 0);

    return items + promotions;
};

export const reloadAmount = state =>
    state.reload.reloads.map(reload => reload.amount).reduce((a, b) => a + b, 0);

export const refundAmount = state =>
    state.reload.refunds.map(refund => refund.amount).reduce((a, b) => a + b, 0);

// Credit to write after a purchase
export const credit = (state, getters) => {
    const initialCredit = state.auth.buyer.credit;
    const reloads = getters.reloadAmount;
    const refunds = getters.refundAmount;
    const basketCost = getters.basketAmount;

    return initialCredit + reloads - basketCost - refunds;
};

// Catering to write after a purchase
export const catering = (state, getters) => {
    const caterings = groupBy(getters.sidebar.catering, 'couponId');

    return state.auth.buyer.catering.map(cat => ({
        id: cat.id,
        balance: caterings[cat.id] ? cat.balance - caterings[cat.id].length : cat.balance
    }));
};

export const sidebar = (state, getters) => {
    let itemList = state.items.basket.itemList.slice();

    // Update items prices according to the logged buyer
    itemList = itemList.map(item => {
        let updatedItem = getters.wiketItems.items.find(i => i.id === item.id) || {
            price: { amount: -1 }
        };
        if (updatedItem.price.amount === -1 && state.auth.device.event.nfc_id === item.id) {
            updatedItem = item;
        }

        // if a custom price is given, take it in account only if the price were editable & if the amount is < the fixed price
        const amount =
            item.paidPrice &&
            updatedItem.price.freePrice &&
            (item.paidPrice < updatedItem.price.amount || item.price.amount === 0)
                ? item.paidPrice
                : updatedItem.price.amount;

        return {
            ...item,
            amount,
            price: updatedItem.price
        };
    });

    let catering = [];
    if (state.auth.device.event.config.useCardData) {
        const computedCatering = computeCatering(
            itemList,
            state.device.coupons,
            state.auth.buyer.catering
        );

        itemList = computedCatering.itemList;
        catering = computedCatering.catering;
    }

    // Compute promotion only if the promotion is available for the buyer
    const availablePromotions = getters.wiketItems.promotions
        .slice()
        .filter(promotion => promotion.price.amount > -1);

    const initialSidebar = computePromotions(itemList, availablePromotions);

    return { ...initialSidebar, catering };
};

export const isOnlyCatering = (state, getters) => {
    const basket = getters.sidebar;
    const reloads = state.reload.reloads;
    const refunds = state.reload.refunds;

    return (
        basket.catering.length > 0 &&
        basket.items.length === 0 &&
        basket.promotions.length === 0 &&
        reloads.length === 0 &&
        refunds.length === 0
    );
};
