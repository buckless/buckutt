import { post } from '../../lib/fetch';

/**
 * Users actions
 */

export function createUserWithMol({ dispatch, getters }, user) {
    let createdUser;

    return post('users', user)
        .then(result => {
            if (result.mail) {
                post('meansoflogin', { type: 'mail', data: result.mail, user_id: result.id });
            }

            dispatch('checkAndAddObjects', { route: 'users', objects: [result] });

            return result;
        })
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

export function removeUserAndMols({ dispatch }, user) {
    return dispatch('retrieveObject', { route: 'users', id: user.id })
        .then(fullUser => {
            const promises = fullUser.meansOfLogin.map(mol =>
                dispatch('removeObject', { route: 'meansoflogin', value: mol })
            );

            return Promise.all(promises);
        })
        .then(() => dispatch('removeObject', { route: 'users', value: user }));
}

export function searchUsers({ dispatch }, { name, min }) {
    let limit = '&limit=1000';

    if (name.length <= 2) {
        limit = `&limit=${min || 10}`;
    }

    return get(`services/manager/searchuser?name=${name}${limit}`).then(results => {
        dispatch('clearObject', 'users');

        if (results.length > 0) {
            dispatch('checkAndAddObjects', { route: 'users', objects: results });
        }

        return [];
    });
}

export function loadUserHistory({ state, dispatch }, user) {
    return get(`services/manager/history?buyer=${user.id}`).then(results => {
        dispatch('clearObject', 'history');
        if (results.history.length > 0) {
            const depth = state.app.focusedElements.findIndex(element => user.id === element.id);

            dispatch('updateFocusedElement', { depth, field: 'credit', value: results.credit });
            dispatch('checkAndAddObjects', { route: 'history', objects: results.history });
        }
        return [];
    });
}

export function cancelTransaction({ state, dispatch }, payload) {
    const transaction = payload.transaction;
    const user = payload.user;

    return post('services/cancelTransaction?addPendingCardUpdates=1', transaction).then(() => {
        const currentTransaction = state.objects.history.find(h => h.id === transaction.id);

        const newUserCredit = user.credit - currentTransaction.amount;
        const depth = state.app.focusedElements.findIndex(element => user.id === element.id);

        dispatch('updateFocusedElement', { depth, field: 'credit', value: newUserCredit });

        const canceledTransaction = { ...currentTransaction };
        canceledTransaction.isCanceled = true;
        canceledTransaction.updated_at = new Date();

        return dispatch('checkAndUpdateObjects', {
            route: 'history',
            objects: [canceledTransaction]
        });
    });
}
