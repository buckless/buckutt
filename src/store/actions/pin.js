/**
 * ChangePin actions
 */

import { get, put } from '../../lib/fetch';

export function changePin({ dispatch }, pins) {
    return new Promise((resolve, reject) => {
        let message = null;

        if (pins.pin !== pins.confirmedPin) {
            message = 'Les deux codes PIN ne sont pas identiques';
        }

        if (pins.currentPin === pins.pin) {
            message = 'L\'ancien et le nouveau code PIN rentrés sont identiques';
        }

        if (pins.pin.length !== 4) {
            message = 'Le nouveau code PIN ne fait pas la bonne longueur';
        }

        if (pins.currentPin.length !== 4) {
            message = 'L\'ancien code est faux';
        }

        if (message) {
            return reject(new Error(message));
        }

        put('changepin', {
            currentPin: pins.currentPin,
            pin       : pins.pin
        }).then((result) => {
            if (!result.changed) {
                return reject(new Error('L\'ancien code est faux'));
            }

            dispatch('updateLoggedUserField', { field: 'pin', value: true });

            resolve({ message: 'Le code PIN a bien été changé' });
        });
    });
}

/**
 * GeneratePin actions
 */

export function askPin(_, mail) {
    return get(`askpin?mail=${mail}`)
        .then((result) => {
            if (!result.success) {
                return Promise.reject(new Error('Cette adresse mail est inconnue'));
            }

            return { message: 'Un mail vient de vous être envoyé à l\'adresse indiquée' };
        })
        .catch(() => Promise.reject(new Error('Une erreur inconnue a eu lieu')));
}

export function generatePin(_, pins) {
    return new Promise((resolve, reject) => {
        let message = null;

        if (pins.pin !== pins.confirmedPin) {
            message = 'Les deux codes PIN ne sont pas identiques';
        }

        if (pins.pin.length !== 4) {
            message = 'Le nouveau code PIN ne fait pas la bonne longueur';
        }

        if (message) {
            return reject(new Error(message));
        }

        put('generatepin', {
            key: pins.key,
            pin: pins.pin
        })
            .then((result) => {
                if (!result.success) {
                    return reject(new Error('Impossible de changer le code PIN.'));
                }

                resolve({ message: 'Le code PIN a bien été changé' });
            })
            .catch(() => reject(new Error('Impossible de changer le code PIN')));
    });
}
