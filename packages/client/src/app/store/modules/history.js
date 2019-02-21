const initialState = {
    history: [],
    catering: {}
};

const mutations = {
    ADD_HISTORY_TRANSACTION(state, payload) {
        state.history.push(payload);
    },

    SET_HISTORY(state, payload) {
        state.history = payload;
    },

    REMOVE_FROM_HISTORY(state, payload) {
        const index = state.history.findIndex(entry => entry.localId === payload.localId);

        state.history.splice(index, 1);
    },

    INCREMENT_CATERING(state, id) {
        if (!state.catering[id]) {
            state.catering[id] = 0;
        }

        state.catering[id] += 1;
    },

    RESET_HISTORY_STATE(state) {
        for (let [key, value] of Object.entries(initialState)) {
            state[key] = value;
        }
    },

    SET_HISTORY_STATE(state, payload) {
        for (let [key, value] of Object.entries(payload)) {
            state[key] = value;
        }
    }
};

export default { state: initialState, mutations };
