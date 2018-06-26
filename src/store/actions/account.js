/**
 * Account supports actions
 */

import { post, put, get } from '../../lib/fetch';

export function assign({ state, dispatch }, { ticketNumber, physicalId }) {
    let message = null;

    return post('assigner', {
        userId: state.app.loggedUser.id,
        ticketNumber,
        physicalId
    })
        .then(user => {
            const updatesToDo = [dispatch('updateLoggedUser', user)];
            if (user.token) {
                updatesToDo.push(dispatch('setToken', user.token));
            }

            return Promise.all(updatesToDo);
        })
        .then(() => dispatch('loadUser'))
        .then(() => {
            if (ticketNumber) {
                return { message: 'Le billet a bien été lié à votre compte' };
            }
            return { message: 'Le support a bien été lié à votre compte' };
        });
}

export const block = ({ state, dispatch }) => {
    if (!window.confirm('Êtes-vous sûr de vouloir bloquer votre carte ?')) {
        return;
    }

    const updatedMeansOfLogin = state.app.loggedUser.meansOfLogin.map(mol => {
        if (mol.type === 'cardId') {
            mol.blocked = true;
        }

        return mol;
    });

    put('block')
        .then(() =>
            dispatch('updateLoggedUserField', {
                field: 'meansOfLogin',
                value: updatedMeansOfLogin
            })
        )
        .catch(() => window.alert('Impossible de bloquer votre carte'));
};

export const canRefund = ({ commit }) => {
    get('accountRefund').then(data => commit('SET_REFUNDABLE', data));
};

export const accountRefund = ({ commit }) => {
    post('accountRefund').then(data => commit('SET_REFUNDABLE', data));
};
