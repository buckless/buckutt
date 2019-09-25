const state = {
    loggedUser: null,
    firstLoad: false,
    history: []
};

const mutations = {
    UPDATELOGGEDUSER(state_, loggedUser) {
        state_.loggedUser = loggedUser;
    },

    UPDATEFIRSTLOAD(state_, firstLoad) {
        state_.firstLoad = firstLoad;
    },

    CLEARHISTORY(state_) {
        state_.history = [];
    },

    SETHISTORY(state_, history) {
        state_.history = history;
    }
};

export default {
    state,
    mutations
};
