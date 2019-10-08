export default (state, getters, error) => {
    if (!error || !error.message) {
        return null;
    }

    console.error(error);

    if (error.message === 'User not found') {
        return getters.sellerLogged ? 'Client introuvable' : 'Identifiants incorrects';
    }

    if (error.message === 'Login error: Wrong credentials') {
        return 'Identifiants incorrects';
    }

    if (error.message === 'Invalid card') {
        return 'Carte invalide';
    }

    if (error.message === 'Read failed') {
        return 'La carte a été retirée trop tôt';
    }

    if (error.message === 'Read error') {
        return 'Une erreur a eu lieu lors de la lecture de la carte';
    }

    if (error.message === 'Locked card') {
        return 'Carte bloquée par son propriétaire ou un administrateur';
    }

    if (error.message === 'Invalid buyer' || error.message === 'Buyer not found') {
        return 'Client introuvable';
    }

    if (error.message === 'Card already assigned') {
        return 'Carte déjà assignée';
    }

    if (error.message === 'Different card used') {
        return 'Une carte différente de la carte initiale a été utilisée.';
    }

    if (error.message === 'Duplicate Entry') {
        return state.auth.seller.canAssign
            ? 'Cette carte est déjà assignée'
            : 'Entrée déjà existante';
    }

    if (error.message === 'Not enough rights') {
        return 'Pas de droit opérateur';
    }

    if (error.message === 'Device not found') {
        return 'Équipement inconnu';
    }

    if (error.message === 'Barcode not found') {
        return 'Code barre inconnu';
    }

    if (error.message === 'Server not reacheable') {
        return 'Cet équipement ne peut pas fonctionner sans connexion Internet.';
    }

    if (error.message.startsWith('Can not reload less than')) {
        return error.message.replace('Can not reload less than', 'Rechargement minimal');
    }

    if (error.message.startsWith('Maximum exceeded')) {
        return error.message.replace('Maximum exceeded', 'Crédit maximum');
    }

    if (error.message.startsWith('Not enough credit')) {
        return error.message.replace(
            'Not enough credit : missing',
            'Crédit insuffisant : il manque'
        );
    }

    if (error.message === 'User unallowed to buy this') {
        if (state.basket.unallowedItemsNames.length === 1) {
            return `Cet utilisateur n'a pas le droit d'acheter l'article suivant: ${
                state.basket.unallowedItemsNames[0]
            }.`;
        }

        return `Cet utilisateur n'a pas le droit d'acheter les articles suivants: ${state.basket.unallowedItemsNames.join(
            ', '
        )}.`;
    }

    if (error.message === 'User unallowed to buy this') {
        if (state.basket.unallowedItemsNames.length === 1) {
            return `Cet utilisateur n'a pas le droit d'acheter l'article suivant: ${
                state.basket.unallowedItemsNames[0]
            }.`;
        }

        return `Cet utilisateur n'a pas le droit d'acheter les articles suivants: ${state.basket.unallowedItemsNames.join(
            ', '
        )}.`;
    }

    return error.message;
};
