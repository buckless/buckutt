const initialState = {
    alert: null,
    device: {
        id: null,
        name: null,
        point: {
            id: null,
            name: null
        },
        wiket: null,
        event: {
            id: null,
            name: null,
            nfc_id: null,
            defaultGroup_id: null,
            config: {
                maxAlcohol: null,
                maxPerAccount: null,
                minReload: null,
                useCardData: null
            }
        },
        config: {
            alcohol: null,
            doubleValidation: null,
            showPicture: null
        },
        privateKey: null
    },
    buyer: {
        id: null,
        credit: 0,
        firstname: null,
        lastname: null,
        memberships: [],
        purchases: [],
        wallet: null,
        catering: [],
        pendingData: {
            version: null,
            ids: []
        }
    },
    seller: {
        wallet: null,
        pin: null,
        id: null,
        token: null,
        firstname: null,
        lastname: null,
        canSell: false,
        canReload: false,
        canAssign: false,
        canControl: false,
        disconnectWarning: false
    },
    groups: []
};

const mutations = {
    SET_PRIVATEKEY(state, payload) {
        state.device.privateKey = payload;
    },

    SET_DEVICE_NAME(state, payload) {
        state.device.name = payload;
    },

    SET_DEVICE(state, payload) {
        state.device.id = payload.id;
        state.device.point = payload.point;
        state.device.wiket = payload.wiket;
        state.device.event.id = payload.event.id;
        state.device.event.name = payload.event.name;
    },

    SET_FULL_DEVICE(state, payload) {
        const keys = ['alcohol', 'doubleValidation', 'showPicture'];

        keys.forEach(key => {
            state.device.config[key] = payload[key];
        });
    },

    DISABLE_DOUBLE_VALIDATION(state) {
        state.device.config.doubleValidation = false;
    },

    SET_EVENT(state, payload) {
        const keys = ['maxAlcohol', 'maxPerAccount', 'minReload', 'useCardData'];

        keys.forEach(key => {
            state.device.event.config[key] = payload[key];
        });

        state.device.event.nfc_id = payload.nfc_id;
        state.device.event.defaultGroup_id = payload.defaultGroup_id;
    },

    SET_SELLER_WALLET(state, wallet) {
        state.seller.wallet = wallet;
    },

    SET_BUYER_WALLET(state, payload) {
        state.buyer.wallet = payload;
    },

    AUTH_SELLER(state, payload) {
        state.seller = {
            ...state.seller,
            ...payload
        };
    },

    SET_GROUPS(state, groups) {
        state.groups = groups;
    },

    UPDATE_TOKEN(state, token) {
        state.seller.token = token;
    },

    AUTH_BUYER(state, payload) {
        state.buyer = {
            ...state.buyer,
            ...payload
        };
    },

    OVERRIDE_BUYER_CREDIT(state, credit) {
        state.buyer.credit = credit;
    },

    LOGOUT_SELLER(state) {
        state.seller = {
            ...initialState.seller
        };
    },

    FIRST_LOGOUT_SELLER(state) {
        state.seller.disconnectWarning = true;
    },

    REMOVE_LOGOUT_WARNING(state) {
        state.seller.disconnectWarning = false;
    },

    LOGOUT_BUYER(state) {
        state.buyer = {
            ...initialState.buyer
        };
    },

    SET_ALERT(state, alert) {
        state.alert = alert;
    },

    CLOSE_ALERT(state) {
        state.alert = null;
    },

    RESET_AUTH_STATE(state) {
        for (let [key, value] of Object.entries(initialState)) {
            state[key] = value;
        }
    }
};

export default { state: initialState, mutations };
