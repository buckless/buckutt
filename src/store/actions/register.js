/**
 * Register actions
 */

import { post } from '../../lib/fetch';

export function register(_, { firstname, lastname, mail, ticketNumber, card }) {
    if (ticketNumber) {
        if (typeof ticketNumber !== 'string' || ticketNumber.length === 0) {
            return Promise.reject(new Error('Ticket ou mail invalide'));
        }
    } else {
        if (typeof firstname !== 'string' || firstname.length === 0) {
            return Promise.reject(new Error('Prénom invalide'));
        }

        if (typeof lastname !== 'string' || lastname.length === 0) {
            return Promise.reject(new Error('Nom invalide'));
        }

        if (typeof mail !== 'string' || mail.length === 0) {
            return Promise.reject(new Error('E-Mail invalide'));
        }
    }

    return post('register', {
        firstname,
        lastname,
        mail,
        ticketNumber,
        physicalId: card
    });
}
