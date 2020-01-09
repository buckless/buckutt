import { i18n } from '../locales';

export const humanError = message => {
    if (message.indexOf('Can not reload less than') > -1) {
        return i18n.t('errors.lessThan', [message.replace('Can not reload less than ', '')]);
    }

    if (message.indexOf('Maximum exceeded') > -1) {
        return i18n.t('errors.maxExceeded', [message.replace('Maximum exceeded ', '')]);
    }

    switch (message) {
        case 'Login error: Wrong credentials':
        case 'Login error: No username provided':
        case 'Login error: No password nor pin provided':
            return i18n.t('errors.wrongCredentials');
        case "Couldn't find ticket":
            return i18n.t('errors.couldntTicket');
        case 'Card not found':
            return i18n.t('errors.couldntSupport');
        case 'This card already belongs to a user':
            return i18n.t('errors.cardAlready');
        case 'This ticket already belongs to another wallet':
            return i18n.t('errors.ticketAlready');
        case 'Duplicate Entry':
            return i18n.t('errors.duplicate');
        case 'This mail is already taken':
            return i18n.t('errors.mailTaken');
        case 'Invalid mail format':
            return i18n.t('errors.mailFormat');
        case 'Unauthorized: insufficient rights':
            return i18n.t('errors.rights');
        case 'Not enough sender credit':
            return i18n.t('errors.notEnoughCredit');
        case 'Too much reciever credit':
            return i18n.t('errors.toMuchCredit');
        case 'Current password is wrong':
            return i18n.t('errors.wrongPassword');
        case 'Current PIN is wrong':
            return i18n.t('errors.wrongPin');
        default:
            return message;
    }
};
