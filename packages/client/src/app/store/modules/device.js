const initialState = {
    storeLoaded: false,
    changeApi: false,
    api: null,
    config: null,
    apis: {},
    coupons: []
};

const mutations = {
    SET_STORE_LOADED(state, payload) {
        state.storeLoaded = payload;
    },

    SET_CHANGE_API(state, payload) {
        state.changeApi = payload;
    },

    SET_API(state, payload) {
        state.api = payload;
    },

    SET_DEVICECONFIG(state, payload) {
        state.config = payload;
    },

    SET_COUPONS(state, payload) {
        state.coupons = payload;
    },

    CHANGE_API(state, payload) {
        if (payload.api) {
            state.apis[payload.api] = {
                ...state.apis[payload.api],
                ...payload
            };
        }
    }
};

export default { state: initialState, mutations };
