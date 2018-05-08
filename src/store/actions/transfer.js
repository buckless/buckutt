import { get, post } from '../../lib/fetch';

export function searchUsers({ commit }, name) {
    const strName = encodeURIComponent(name);

    get(`searchuser?name=${strName}&limit=15`).then(users => {
        commit('CHANGEUSERS', users);
    });
}

export function transfer({ dispatch, state }, data) {
    let message = '';

    if (!data.user || !data.user.id) {
        message = 'Merci de sélectionner un utilisateur';
    } else {
        data.amount = parseFloat(data.amount);
        if (!data.amount || Number.isNaN(data.amount)) {
            message = 'Le montant doit être un nombre supérieur à 0';
        }

        if (data.user.id === state.app.loggedUser.id) {
            message = "Impossible de s'envoyer de l'argent";
        }
    }

    if (message) {
        return Promise.reject(new Error(message));
    }

    const transferData = {
        currentPin: data.currentPin,
        amount: +(+data.amount * 100).toFixed(1),
        reciever_id: data.user.id
    };

    return post('transfer', transferData).then(result => {
        if (!result.newCredit) {
            return Promise.reject(new Error(result.message));
        }

        // Reload full history
        dispatch('loadHistory');

        return { message: 'Le virement a bien été effectué' };
    });
}
