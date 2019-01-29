const initialState = {
    history: [],
    pendingCancellations: [],
    catering: {}
};

const mutations = {
    ADD_HISTORY_TRANSACTION(state, payload) {
        state.history.push(payload);
    },

    SET_HISTORY(state, payload) {
        state.history = payload;
    },

    ADD_PENDING_CANCELLATION(state, payload) {
        state.pendingCancellations.push(payload);
    },

    SET_PENDING_CANCELLATIONS(state, payload) {
        state.pendingCancellations = payload;
    },

    CLEAR_PENDING_CANCELLATIONS(state) {
        state.pendingCancellations = [];
    },

    REMOVE_FROM_HISTORY(state, payload) {
        const index = state.history.findIndex(entry => entry.localId === payload.localId);

        state.history.splice(index, 1);
    },

    REMOVE_PENDING_CANCELLATION(state, payload) {
        const index = state.pendingCancellations.findIndex(
            entry => entry.localId === payload.localId
        );

        state.pendingCancellations.splice(index, 1);
    },

    UPDATE_HISTORY_ENTRY(state, payload) {
        const historyIndex = state.history.findIndex(entry => payload.localId === entry.localId);

        if (historyIndex > -1) {
            state.history.splice(historyIndex, 1, {
                ...state.history[historyIndex],
                transactionIds: payload.basketData.transactionIds
            });
        }
    },

    UPDATE_PENDING_CANCELLATIONS_ENTRY(state, payload) {
        const pendingIndex = state.pendingCancellations.findIndex(
            entry => payload.localId === entry.localId
        );

        if (pendingIndex > -1) {
            state.pendingCancellations.splice(pendingIndex, 1, {
                ...state.pendingCancellations[pendingIndex],
                transactionIds: payload.basketData.transactionIds
            });
        }
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
