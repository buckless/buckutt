const initialState = {
    basketStatus: 'WAITING',
    writing: false,
    pendingCardUpdates: []
};

const mutations = {
    SET_BASKET_STATUS(state, status) {
        state.basketStatus = status;
    },

    SET_WRITING(state, writing) {
        state.writing = writing;
    },

    SET_PENDINGCARDUPDATES(state, payload) {
        state.pendingCardUpdates = payload;
    },

    REMOVE_PENDINGCARDUPDATE(state, cardId) {
        const index = state.pendingCardUpdates.indexOf(cardId);
        if (index > -1) {
            state.pendingCardUpdates.splice(index, 1);
        }
    }
};

export default { state: initialState, mutations };
