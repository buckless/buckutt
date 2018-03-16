const initialState = {
    status         : false,
    syncing        : false,
    pendingRequests: [],
    offline        : {
        sellers     : [],
        defaultItems: {
            articles  : [],
            promotions: []
        }
    }
};

const mutations = {
    SET_ONLINE(state) {
        state.status = true;
    },

    SET_OFFLINE(state) {
        state.status = false;
    },

    SET_SYNCING(state, payload) {
        state.syncing = payload;
    },

    SET_SELLERS(state, payload) {
        state.offline.sellers = payload;
    },

    SET_DEFAULT_ITEMS(state, payload) {
        state.offline.defaultItems = payload;
    },

    ADD_PENDING_REQUEST(state, payload) {
        state.pendingRequests.push(payload);
    },

    SET_PENDING_REQUESTS(state, payload) {
        state.pendingRequests = payload;
    },

    CLEAR_PENDING_REQUESTS(state) {
        state.pendingRequests = [];
    }
};

export default { state: initialState, mutations };
