const initialState = {
    opened: false
};

const mutations = {
    TOGGLE_TREASURY(state) {
        state.opened = !state.opened;
    }
};

export default { state: initialState, mutations };
