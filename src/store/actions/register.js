/**
 * Registr actions
 */

import { get, post } from '../../lib/fetch';

export function assign(_, { ticketNumber }) {
    if (typeof ticketNumber !== 'string' || ticketNumber.length === 0) {
        return Promise.reject(new Error('Ticket ou mail invalide'));
    }

    return get(`assigner?ticketOrMail=${ticketNumber}`);
}

export function register(_, { firstname, lastname, rmail }) {
    if (typeof firstname !== 'string' || firstname.length === 0) {
        return Promise.reject(new Error('Prénom invalide'));
    }

    if (typeof lastname !== 'string' || lastname.length === 0) {
        return Promise.reject(new Error('Nom invalide'));
    }

    if (typeof rmail !== 'string' || rmail.length === 0) {
        return Promise.reject(new Error('E-Mail invalide'));
    }

    return post('register', {
        firstname,
        lastname,
        mail: rmail
    });
}
