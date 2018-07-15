const state = {
    ticket: false,
    card: false
};

const mutations = {
    SET_TICKET(state_, payload) {
        state_.ticket = payload;
    },

    SET_CARD(state_, payload) {
        state_.card = payload;
    }
};

export default {
    state,
    mutations
};
