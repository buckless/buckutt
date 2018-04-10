import { get, post } from '../../lib/fetch';

export function searchUsers({ commit }, name) {
    const strName = encodeURIComponent(name);

    get(`searchuser?name=${strName}&limit=15`).then(users => {
        commit('CHANGEUSERS', users);
    });
}

export function transfer({ dispatch }, data) {
    let message = '';

    if (data.currentPin.length !== 4) {
        message = "L'ancien code est faux";
    }

    if (!data.user) {
        message = 'Merci de sélectionner un utilisateur';
    }

    if (!data.amount || Number.isNaN(data.amount)) {
        message = 'Le montant doit être un nombre';
    }

    if (message) {
        throw new Error(message);
    }

    const transferData = {
        currentPin: data.currentPin,
        amount: +(+data.amount * 100).toFixed(1),
        reciever_id: data.user.id
    };

    return post('transfer', transferData).then(result => {
        if (!result.newCredit) {
            throw new Error(result.message);
        }

        // Reload full history
        dispatch('loadHistory');

        return { message: 'Le virement a bien été effectué' };
    });
}
