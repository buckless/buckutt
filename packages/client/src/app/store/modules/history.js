const initialState = {
    catering: {}
};

const mutations = {
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
