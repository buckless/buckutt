const initialState = {
    freePriceMode: false,
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
        cardPaid: 0,
        usedCatering: []
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
            cardPaid: 0,
            usedCatering: []
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
    },

    RESET_UI_STATE(state) {
        for (let [key, value] of Object.entries(initialState)) {
            state[key] = value;
        }
    },

    SWITCH_FREE_PRICE_MODE(state) {
        state.freePriceMode = !state.freePriceMode;
    }
};

export default { state: initialState, mutations };
