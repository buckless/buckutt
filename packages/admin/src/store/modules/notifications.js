const state = {
    error: null,
    notify: null
};

const mutations = {
    UPDATEERROR(state_, error) {
        state_.error = error;
    },

    UPDATENOTIFY(state_, notify) {
        state_.notify = notify;
    }
};

export default {
    state,
    mutations
};
