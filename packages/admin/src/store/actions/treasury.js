import { get } from '../../lib/fetch';
import queryString from '../../lib/queryString';
import treasuryQueryString from '../../lib/treasuryQueryString';

/**
 * Purchases actions
 */

export function getPurchases({ commit, dispatch }, fields) {
    const qString = treasuryQueryString(fields);

    return get(`stats/purchases?${qString}`)
        .then(purchases => {
            commit('CLEAROBJECT', 'purchases');
            dispatch('checkAndAddObjects', {
                route: 'purchases',
                objects: purchases
            });

            return get(`stats/withdrawals?${qString}`);
        })
        .then(withdrawals => {
            commit('CLEAROBJECT', 'withdrawals');
            dispatch('checkAndAddObjects', {
                route: 'withdrawals',
                objects: withdrawals
            });
        });
}

/**
 * Treasury actions
 */

export function getTreasury({ commit, dispatch }, fields) {
    const qt = [];

    if (fields.dateIn) {
        qt.push({
            field: 'clientTime',
            ge: fields.dateIn,
            date: true
        });
    }

    if (fields.dateOut) {
        qt.push({
            field: 'clientTime',
            le: fields.dateOut,
            date: true
        });
    }

    const qString = treasuryQueryString(fields);
    let orQt = queryString(qt);

    if (orQt) {
        orQt = `&q=${orQt}`;
    }

    return get(`stats/reloads?${qString}`)
        .then(reloads => {
            commit('CLEAROBJECT', 'reloads');
            dispatch('checkAndAddObjects', { route: 'reloads', objects: reloads });

            return get(`stats/refunds?${qString}`);
        })
        .then(refunds => {
            commit('CLEAROBJECT', 'refunds');
            dispatch('checkAndAddObjects', { route: 'refunds', objects: refunds });
        });
}
