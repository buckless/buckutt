const initialState = {
    status: false,
    syncing: false,
    offline: {
        blockedCards: [],
        sellers: [],
        defaultItems: {
            articles: [],
            promotions: []
        }
    },
    lastUsersUpdate: null
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

    SET_BLOCKED_CARDS(state, payload) {
        state.offline.blockedCards = payload;
    },

    SET_LAST_USERS_UPDATE(state, date) {
        state.lastUsersUpdate = date;
    }
};

export default { state: initialState, mutations };
