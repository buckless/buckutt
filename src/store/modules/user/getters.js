export const hasUser = state => !!state.user;
export const user = state => state.user;
export const credit = state => (state.user ? state.user.credit : 0);
export const giftReloads = state => state.giftReloads;
export const linkedUsers = state => state.linkedUsers.filter(u => u.username);

export const hasCard = state => {
    if (!state.user) {
        return false;
    }

    return (state.user.meansOfLogin || []).find(mol => mol.type === 'cardId');
};

export const cardBlocked = state => {
    if (!state.user || !state.user.meansOfLogin) {
        return null;
    }

    const cards = state.user.meansOfLogin.filter(mol => mol.type === 'cardId');

    return cards.length > 0 && !cards.some(mol => !mol.blocked);
};

export const card = state => {
    if (!state.user || !state.user.meansOfLogin) {
        return null;
    }

    return (state.user.meansOfLogin.find(mol => mol.type === 'cardId') || {}).data;
};

export const ticket = state => {
    if (!state.user || !state.user.meansOfLogin) {
        return null;
    }

    return (state.user.meansOfLogin.find(mol => mol.type === 'ticketId') || {}).data;
};

export const blockedCards = state => {
    if (!state.user || !state.user.meansOfLogin) {
        return [];
    }

    return state.user.meansOfLogin
        .filter(mol => mol.type === 'cardId' && mol.blocked)
        .map(blockedCard => blockedCard.physical_id || blockedCard.data);
};
