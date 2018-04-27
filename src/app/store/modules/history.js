const initialState = {
    opened: false,
    history: [],
    pendingCancellations: []
};

const mutations = {
    ADD_HISTORY_TRANSACTION(state, payload) {
        state.history.push(payload);
    },

    ADD_PENDING_CANCELLATION(state, payload) {
        state.pendingCancellations.push(payload);
        window.localStorage.setItem(
            'pendingCancellations',
            JSON.stringify(state.pendingCancellations)
        );
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

        window.localStorage.setItem(
            'pendingCancellations',
            JSON.stringify(state.pendingCancellations)
        );
    },

    UPDATE_HISTORY_ENTRY(state, payload) {
        const historyIndex = state.history.findIndex(entry => payload.localId === entry.localId);
        const pendingIndex = state.pendingCancellations.findIndex(
            entry => payload.localId === entry.localId
        );

        if (historyIndex > -1) {
            state.history.splice(historyIndex, 1, {
                ...state.history[historyIndex],
                transactionIds: payload.basketData.transactionIds
            });
        }

        if (pendingIndex > -1) {
            state.pendingCancellations.splice(pendingIndex, 1, {
                ...state.pendingCancellations[pendingIndex],
                transactionIds: payload.basketData.transactionIds
            });

            window.localStorage.setItem(
                'pendingCancellations',
                JSON.stringify(state.pendingCancellations)
            );
        }
    },

    TOGGLE_HISTORY(state) {
        state.opened = !state.opened;
    }
};

export default { state: initialState, mutations };
