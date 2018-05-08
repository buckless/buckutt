import Vue from 'vue';

const initialState = {
    opened: false
};

const mutations = {
    TOGGLE_CATERING(state) {
        state.opened = !state.opened;
    }
};

export default { state: initialState, mutations };
