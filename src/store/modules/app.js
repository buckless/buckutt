const state = {
    loggedUser: null,
    loggedLinkedUsers: [],
    history: [],
    users: [],
    giftReloads: [],
    pending: 0
};

const mutations = {
    UPDATELOGGEDUSER(state_, loggedUser) {
        state_.loggedUser = loggedUser;
    },

    UPDATELINKEDUSERS(state_, linkedUsers) {
        state_.loggedLinkedUsers = linkedUsers;
    },

    ADDHISTORY(state_, data) {
        state_.history.push(...data);
    },

    REPLACEHISTORY(state_, data) {
        // empty the array
        state_.history.splice(0, state_.history.length);

        state_.history.push(...data);
    },

    CLEARHISTORY(state_) {
        state_.history = [];
    },

    CHANGEUSERS(state_, users) {
        state_.users = users;
    },

    SET_PENDING_AMOUNT(state_, pending) {
        state_.pending = pending;
    },

    SET_GIFT_RELOADS(state_, giftReloads) {
        state_.giftReloads = giftReloads;
    },

    BLOCK_CARDS(state_) {
        state_.loggedUser.meansOfLogin = state_.loggedUser.meansOfLogin.map(mol => {
            if (mol.type === 'cardId') {
                mol.blocked = true;
            }

            return mol;
        });
    }
};

export default {
    state,
    mutations
};
