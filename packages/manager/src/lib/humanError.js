export default message => {
    if (message.indexOf('Can not reload less than') > -1) {
        return message.replace('Can not reload less than', 'Rechargement minimal');
    }

    if (message.indexOf('Maximum exceeded') > -1) {
        return message.replace('Maximum exceeded', 'Solde maximal');
    }

    switch (message) {
        case 'Login error: Wrong credentials':
        case 'Login error: No (meanOfLogin) data provided':
        case 'Login error: No password nor pin provided':
            return 'Identifiants incorrects';
        case "Couldn't find ticket":
            return "Ce billet n'existe pas";
        case 'Physical support not found':
            return "Ce support n'existe pas";
        case 'Card already binded':
            return 'Cette carte appartient à déjà un autre compte';
        case 'Ticket already binded':
            return 'Ce billet appartient à déjà un autre compte';
        case 'Duplicate Entry':
            return 'Cette carte est déjà associée à votre compte';
        case 'User mail exists':
            return 'Cette adresse e-mail est déjà utilisée';
        case 'Unauthorized: insufficient rights':
            return 'Droits insuffisants';
        case 'Not enough sender credit':
            return 'Pas assez de crédit';
        default:
            return message;
    }
};
