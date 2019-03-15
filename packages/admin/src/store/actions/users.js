import { get, post } from '../../lib/fetch';
import queryString from '../../lib/queryString';
import routeToRelation from '../../lib/routeToRelation';

/**
 * Users actions
 */

export function createUserWithMembership({ dispatch, getters }, user) {
    let createdUser;

    return post('crud/users', user)
        .then(newUser => {
            createdUser = newUser;

            return dispatch('createObject', {
                route: 'memberships',
                value: {
                    user_id: createdUser.id,
                    group_id: getters.event.defaultGroup_id,
                    period_id: getters.event.defaultPeriod_id
                }
            });
        })
        .then(() => createdUser);
}

export function searchUsers({ dispatch }, { name, min }) {
    let limit = '&limit=1000';

    if (name.length <= 2) {
        limit = `&limit=${min || 10}`;
    }

    return get(`manager/searchuser?name=${name}${limit}`).then(results => {
        dispatch('clearObject', 'users');

        if (results.length > 0) {
            dispatch('checkAndAddObjects', { route: 'users', objects: results });
        }

        return [];
    });
}

export function loadWalletHistory({ state, dispatch }, wallet) {
    return get(`manager/account/history?wallet=${wallet.id}`).then(results => {
        dispatch('clearObject', 'history');
        if (results.history.length > 0) {
            const depth = state.app.focusedElements.findIndex(element => wallet.id === element.id);

            dispatch('updateFocusedElement', {
                depth,
                field: 'credit',
                value: results.credit
            });
            dispatch('checkAndAddObjects', {
                route: 'history',
                objects: results.history
            });
        }
        return [];
    });
}

export function cancelTransaction({ state, dispatch }, payload) {
    const transaction = payload.transaction;
    const wallet = payload.wallet;

    return post('payment/cancelTransaction', transaction).then(() => {
        const currentTransaction = state.objects.history.find(h => h.id === transaction.id);

        const newWalletCredit = wallet.credit - currentTransaction.amount;
        const depth = state.app.focusedElements.findIndex(element => wallet.id === element.id);

        dispatch('updateFocusedElement', {
            depth,
            field: 'credit',
            value: newWalletCredit
        });
    });
}

export function searchWallets({ dispatch }, { wallet, min }) {
    const limit = wallet.length <= 2 ? `&limit=${min || 10}` : '';

    let orQt = '';
    if (wallet) {
        const qt = [
            {
                field: 'physical_id',
                eq: wallet
            }
        ];

        orQt = `&q=${queryString(qt)}`;
    }

    const relEmbed = routeToRelation('wallets');

    return get(`crud/wallets?embed=${relEmbed}${orQt}${limit}`).then(results => {
        dispatch('clearObject', 'wallets');

        if (results.length > 0) {
            dispatch('checkAndAddObjects', {
                route: 'wallets',
                objects: results
            });
        }

        return [];
    });
}
