import Vue from 'vue';

export const initialState = {
    queue: {}
};

export const reducer = {
    PUSH(state, notification) {
        Vue.set(state.queue, notification.id, notification);
    },

    CLEAR(state, notificationId) {
        state.queue = Object.fromEntries(
            Object.entries(state.queue).filter(entry => entry[0] !== notificationId)
        );
    }
};
