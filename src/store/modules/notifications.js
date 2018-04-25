const state = {
    notify: null
};

const mutations = {
    UPDATENOTIFY(state_, notify) {
        if (notify.message === 'Current PIN is wrong') {
            notify.message = 'Code PIN invalide.';
        }

        state_.notify = notify;
    }
};

export default {
    state,
    mutations
};
