const initialState = {
    status: false,
    offline: {
        blockedCards: [],
        sellers: [],
        defaultItems: {
            articles: [],
            promotions: []
        },
        eventEssentials: {
            locked: false,
            lastUpdate: null
        },
        usersData: {
            locked: false,
            lastUpdate: null
        },
        items: {
            locked: false,
            lastUpdate: null
        },
        queue: {
            locked: false,
            lastUpdate: null
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

    SET_SELLERS(state, payload) {
        state.offline.sellers = payload;
    },

    SET_DEFAULT_ITEMS(state, payload) {
        state.offline.defaultItems = payload;
    },

    SET_BLOCKED_CARDS(state, payload) {
        state.offline.blockedCards = payload;
    },

    LOCK_ITEMS_UPDATE(state, payload) {
        state.offline.items.locked = payload;
    },

    LOCK_ESSENTIALS_UPDATE(state, payload) {
        state.offline.eventEssentials.locked = payload;
    },

    LOCK_USERS_UPDATE(state, payload) {
        state.offline.usersData.locked = payload;
    },

    LOCK_QUEUE(state, payload) {
        state.offline.queue.locked = payload;
    },

    SET_LAST_ITEMS_UPDATE(state, payload) {
        state.offline.items.lastUpdate = payload;
    },

    SET_LAST_ESSENTIALS_UPDATE(state, payload) {
        state.offline.eventEssentials.lastUpdate = payload;
    },

    SET_LAST_USERS_UPDATE(state, payload) {
        state.offline.usersData.lastUpdate = payload;
    },

    SET_LAST_QUEUE(state, payload) {
        state.offline.queue.lastUpdate = payload;
    },

    RESET_ONLINE_STATE(state) {
        for (let [key, value] of Object.entries(initialState)) {
            state[key] = value;
        }
    }
};

export default { state: initialState, mutations };
