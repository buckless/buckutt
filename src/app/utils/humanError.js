import { credit } from '../store/getters/items';

export default (state, getters, error) => {
    if (!error) {
        return null;
    }

    console.error(error);

    if (error.message === 'User not found') {
        return state.auth.seller.isAuth ? 'Client introuvable' : 'Identifiants incorrects';
    }

    if (error.message === 'Login error: Wrong credentials') {
        return 'Identifiants incorrects';
    }

    if (error.message === 'Invalid card') {
        return 'Carte invalide';
    }

    if (error.message === 'Locked card') {
        return 'Carte bloquée par son propriétaire ou un administrateur';
    }

    if (error.message === "Couldn't find ticket") {
        return 'Ticket introuvable';
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

    if (error.message === 'Server not reacheable') {
        return 'Cet équipement ne peut pas fonctionner sans connexion Internet.';
    }

    if (error.message.startsWith('Can not reload less than')) {
        return error.message.replace('Can not reload less than', 'Rechargement minimal');
    }

    if (error.message.startsWith('Maximum exceeded')) {
        return error.message.replace('Maximum exceeded', 'Crédit maximum');
    }

    if (error.message === 'Not enough credit') {
        return `Pas assez de crédit: ${(credit(state, getters) / 100).toFixed(2)}€`;
    }

    if (error.message === 'Catering not available today') {
        return "Aucun catering disponible aujourd'hui.";
    }

    if (error.message === 'Insufficient balance for today') {
        return "Le solde de cet article est épuisé pour aujourd'hui.";
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
