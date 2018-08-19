export const SET_USER = (state, payload) => {
    state.user = payload;
};

export const SET_LINKED_USERS = (state, payload) => {
    state.linkedUsers = payload;
};

export const SET_GIFT_RELOADS = (state, payload) => {
    state.giftReloads = payload;
};

export const BLOCK_CARD = (state, cardId) => {
    if (!state.user || !state.user.meansOfLogin) {
        return;
    }

    state.user.meansOfLogin = state.user.meansOfLogin.map(mol => {
        if (mol.type === 'cardId' && mol.data === cardId) {
            return {
                ...mol,
                blocked: true
            };
        }

        return mol;
    });
};
