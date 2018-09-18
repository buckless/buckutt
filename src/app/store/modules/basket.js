const initialState = {
    basketStatus: 'WAITING',
    writing: false,
    unallowedItemsNames: []
};

const mutations = {
    SET_BASKET_STATUS(state, status) {
        state.basketStatus = status;
    },

    SET_WRITING(state, writing) {
        state.writing = writing;
    },

    SET_UNALLOWED_ITEMS_NAMES(state, payload) {
        state.unallowedItemsNames = payload;
    }
};

export default { state: initialState, mutations };
