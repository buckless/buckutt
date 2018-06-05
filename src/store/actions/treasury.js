import { get } from '../../lib/fetch';
import queryString from '../../lib/queryString';
import treasuryQueryString from '../../lib/treasuryQueryString';
import routeToRelation from '../../lib/routeToRelation';

/**
 * Purchases actions
 */

export function getPurchases({ commit, dispatch }, fields) {
    const qString = treasuryQueryString(fields);

    return get(`services/treasury/purchases?${qString}`)
        .then(purchases => {
            commit('CLEAROBJECT', 'purchases');
            const purchasesWT = purchases.map(purchase => {
                const newPurchase = Object.assign({}, purchase);
                newPurchase.totalWT = newPurchase.totalTI - newPurchase.totalVAT;

                return newPurchase;
            });
            dispatch('checkAndAddObjects', { route: 'purchases', objects: purchasesWT });

            return get(`services/treasury/withdrawals?${qString}`)
        })
        .then(withdrawals => {
            commit('CLEAROBJECT', 'withdrawals');
            dispatch('checkAndAddObjects', { route: 'withdrawals', objects: withdrawals });
        });
}

/**
 * Treasury actions
 */

export function getTreasury({ commit, dispatch }, fields) {
    const qt = [];

    if (fields.dateIn) {
        qt.push({
            field: 'created_at',
            ge: fields.dateIn,
            date: true
        });
    }

    if (fields.dateOut) {
        qt.push({
            field: 'created_at',
            le: fields.dateOut,
            date: true
        });
    }

    const qString = treasuryQueryString(fields);
    let orQt = queryString(qt);

    if (orQt) {
        orQt = `&q=${orQt}`;
    }

    return get(`services/treasury/reloads?${qString}`)
        .then(reloads => {
            commit('CLEAROBJECT', 'reloads');
            const idReloads = reloads.map(reload => {
                const newReload = Object.assign({}, reload);
                newReload.id = newReload.type;

                return newReload;
            });

            dispatch('checkAndAddObjects', { route: 'reloads', objects: idReloads });

            return get(`services/treasury/refunds?${qString}`);
        })
        .then(refunds => {
            commit('CLEAROBJECT', 'refunds');
            const idRefunds = refunds.map(refund => {
                const newRefund = Object.assign({}, refund);
                newRefund.id = newRefund.type;

                return newRefund;
            });

            dispatch('checkAndAddObjects', { route: 'refunds', objects: idRefunds });

            const relEmbed = routeToRelation('transfers');

            return get(`transfers?embed=${relEmbed}${orQt}`);
        })
        .then(transfers => {
            commit('CLEAROBJECT', 'transfers');
            dispatch('checkAndAddObjects', { route: 'transfers', objects: transfers });
        });
}
