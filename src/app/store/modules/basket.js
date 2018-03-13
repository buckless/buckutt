const initialState = {
    basketStatus: 'WAITING',
    isWriting   : false
};

const mutations = {
    SET_BASKET_STATUS(state, status) {
        state.basketStatus = status;
    },

    SET_WRITING(state, writing) {
        state.writing = writing;
    }
};

export default { state: initialState, mutations };
