/**
 * ChangePin actions
 */

import { get, put } from '../../lib/fetch';

export function changePin({ dispatch }, pins) {
    let message = null;

    if (pins.pin !== pins.confirmedPin) {
        message = 'Les deux codes PIN ne sont pas identiques';
    }

    if (pins.currentPin === pins.pin) {
        message = "L'ancien et le nouveau code PIN rentrés sont identiques";
    }

    if (message) {
        return Promise.reject(new Error(message));
    }

    return put('changepin', {
        currentPin: pins.currentPin,
        pin: pins.pin
    }).then(result => {
        if (!result.changed) {
            return reject(new Error("L'ancien code est faux"));
        }

        dispatch('updateLoggedUserField', { field: 'pin', value: true });

        return { message: 'Le code PIN a bien été changé' };
    });
}

/**
 * GeneratePin actions
 */

export function askPin(_, mail) {
    return get(`askpin?mail=${mail}`)
        .then(result => {
            if (!result.success) {
                return Promise.reject(new Error('Cette adresse mail est inconnue'));
            }

            return { message: "Un mail vient de vous être envoyé à l'adresse indiquée" };
        })
        .catch(() => Promise.reject(new Error('Cette adresse mail est inconnue')));
}

export function generatePin(_, pins) {
    if (pins.pin !== pins.confirmedPin) {
        return Promise.reject(new Error('Les deux codes PIN ne sont pas identiques'));
    }

    return put('generatepin', {
        key: pins.key,
        pin: pins.pin
    })
        .then(result => {
            if (!result.success) {
                return reject(new Error('Impossible de changer le code PIN.'));
            }

            return { message: 'Le code PIN a bien été changé' };
        })
        .catch(() => reject(new Error('Impossible de changer le code PIN.')));
}
