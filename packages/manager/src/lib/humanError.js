import i18n from '@/i18n';

export default message => {
    if (i18n.locale !== 'fr') {
        return message;
    }

    if (message.indexOf('Can not reload less than') > -1) {
        return message.replace('Can not reload less than', 'Rechargement minimal');
    }

    if (message.indexOf('Maximum exceeded') > -1) {
        return message.replace('Maximum exceeded', 'Solde maximal');
    }

    switch (message) {
        case 'Login error: Wrong credentials':
        case 'Login error: No username provided':
        case 'Login error: No password nor pin provided':
            return 'Identifiants incorrects';
        case "Couldn't find ticket":
            return "Ce billet n'existe pas";
        case 'Card not found':
            return "Ce support n'existe pas";
        case 'This card already belongs to a user':
            return 'Ce support appartient déjà à un autre compte';
        case 'This ticket already belongs to another wallet':
            return 'Ce billet appartient déjà à un autre compte';
        case 'Duplicate Entry':
            return 'Cette carte est déjà associée à votre compte';
        case 'This mail is already taken':
            return 'Cette adresse e-mail est déjà utilisée';
        case 'Unauthorized: insufficient rights':
            return 'Droits insuffisants';
        case 'Not enough sender credit':
            return 'Votre crédit est insuffisant pour transférer cette somme';
        case 'Too much reciever credit':
            return 'Le receveur a un crédit déjà trop important pour recevoir cette somme';
        default:
            return message;
    }
};
