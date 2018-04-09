const state = {
    socket: null,
    modelsToRoutes: {}
};

const mutations = {
    CHANGESOCKET(state_, socket) {
        state_.socket = socket;
    },

    REMOVESOCKET(state_) {
        state_.socket = null;
    },

    ADDMODELSTOROUTES(state_, modelsToRoutes) {
        Object.keys(modelsToRoutes).forEach(key => {
            if (!state_.modelsToRoutes[key]) {
                state_.modelsToRoutes[key] = modelsToRoutes[key];
            }
        });
    }
};

export default {
    state,
    mutations
};
