import { get, post } from '../../lib/fetch';
import queryString from '../../lib/queryString';
import routeToRelation from '../../lib/routeToRelation';

/**
 * Users actions
 */

export const createUser = async ({ dispatch, getters }, user) => {
    const newUser = await post('crud/users', user);
    await dispatch('createObject', {
        route: 'memberships',
        value: {
            user_id: newUser.id,
            group_id: getters.event.defaultGroup_id,
            period_id: getters.event.defaultPeriod_id
        }
    });

    await dispatch('createObject', {
        route: 'wallets',
        value: { user_id: newUser.id }
    });

    return newUser;
};

export const searchUsers = async ({ commit }, { input, min }) => {
    let limit = '&limit=1000';

    if (name.length <= 2) {
        limit = `&limit=${min || 10}`;
    }

    const results = await get(`manager/searchuser?name=${input}${limit}`);

    if (results.length > 0) {
        commit('SETOBJECTS', { route: 'users', objects: results });
    }

    return [];
};

export const loadWalletHistory = async ({ commit }, wallet) => {
    const results = await get(`manager/account/history?wallet=${wallet.id}`);
    commit('CLEARHISTORY');
    if (results.history.length > 0) {
        commit('SETHISTORY', results.history);
    }
    return results;
};

export const cancelTransaction = async ({ commit }, payload) => {
    const transaction = payload.transaction;
    const wallet = payload.wallet;

    await post('payment/cancelTransaction', transaction);

    commit('SETOBJECTS', {
        route: 'wallets',
        objects: [
            {
                ...wallet,
                credit: wallet.credit - transaction.amount
            }
        ]
    });
};

export const searchWallets = async ({ commit }, { input, min }) => {
    const limit = input.length <= 2 ? `&limit=${min || 10}` : '';

    let orQt = '';
    if (input) {
        const qt = [
            {
                field: 'physical_id',
                eq: input
            }
        ];

        orQt = `&q=${queryString(qt)}`;
    }

    const relEmbed = routeToRelation('wallets');
    const results = await get(`crud/wallets?embed=${relEmbed}${orQt}${limit}`);

    if (results.length > 0) {
        commit('SETOBJECTS', {
            route: 'wallets',
            objects: results
        });
    }

    return [];
};
