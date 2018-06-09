const initialState = {
    items: [],
    promotions: [],
    basket: {
        itemList: []
    },
    giftReloads: [],
    nfcCosts: []
};

const mutations = {
    SET_GIFTRELOADS(state, payload) {
        state.giftReloads = payload;
    },

    SET_NFCCOSTS(state, payload) {
        state.nfcCosts = payload;
    },

    SET_ITEMS(state, payload) {
        state.items = payload;
    },

    SET_PROMOTIONS(state, payload) {
        state.promotions = payload;
    },

    ADD_ITEM(state, item) {
        state.basket.itemList.push(item);
    },

    REMOVE_ITEM(state, { id }) {
        const index = state.basket.itemList.findIndex(item => item.id === id);

        state.basket.itemList.splice(index, 1);
    },

    CLEAR_ITEMS(state) {
        state.items = [];
    },

    CLEAR_PROMOTIONS(state) {
        state.promotions = [];
    },

    CLEAR_BASKET(state) {
        state.basket = {
            itemList: []
        };
    },

    LOGOUT_BUYER(state) {
        state.basket = {
            itemList: []
        };
    }
};

export default { state: initialState, mutations };
