const state = {
    currentId: 0,
    messages: []
};

const mutations = {
    NOTIFY(state_, notification) {
        state_.messages.push({
            id: state_.currentId,
            content: notification
        });

        state_.currentId++;

        if (state_.messages.length > 10) {
            state_.messages.splice(0, state_.messages.length - 10);
        }
    },

    REMOVE_NOTIFICATION(state_, id) {
        state_.messages = state_.messages.filter(message => message.id !== id);
    }
};

export default {
    state,
    mutations
};
