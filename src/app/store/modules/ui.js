const initialState = {
    dataLoaded: null,
    inputStream: [],
    tabs: [],
    currentTabId: null,
    lastUser: {
        display: false,
        name: null,
        localId: null,
        bought: 0,
        reload: 0,
        credit: 0,
        cardPaid: 0
    },
    error: null
};

const mutations = {
    SET_DATA_LOADED(state, loaded = true) {
        state.dataLoaded = loaded;
    },

    APPEND_INPUT_STREAM(state, { key }) {
        state.inputStream.push(key);
    },

    CLEAR_INPUT_STREAM(state) {
        state.inputStream = [];
    },

    CHANGE_TAB(state, tab) {
        state.currentTabId = tab;
    },

    EMPTY_TICKET(state) {
        state.lastUser = {
            display: false,
            name: null,
            localId: null,
            bought: 0,
            reload: 0,
            credit: 0,
            cardPaid: 0
        };
    },

    SET_LAST_USER_CARD_PAID(state, payload) {
        state.lastUser.cardPaid = payload;
    },

    SET_LAST_USER(state, payload) {
        payload.cardPaid = state.lastUser.cardPaid;
        state.lastUser = payload;
    },

    ERROR(state, err) {
        state.error = err;
    }
};

export default { state: initialState, mutations };
