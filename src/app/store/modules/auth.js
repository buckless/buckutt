const initialState = {
    alert: null,
    device: {
        id: null,
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
        }
    },
    buyer: {
        isAuth: false,
        id: null,
        credit: 0,
        firstname: null,
        lastname: null,
        memberships: [],
        purchases: [],
        meanOfLogin: ''
    },
    seller: {
        isAuth: false,
        meanOfLogin: '',
        pin: '',
        id: '',
        token: '',
        firstname: '',
        lastname: '',
        canSell: false,
        canReload: false,
        canAssign: false,
        canControl: false,
        disconnectWarning: false
    },
    groups: []
};

const mutations = {
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

    ID_SELLER(state, meanOfLogin) {
        state.seller.meanOfLogin = meanOfLogin;
    },

    SET_BUYER_MOL(state, payload) {
        state.buyer.meanOfLogin = payload;
    },

    AUTH_SELLER(state, payload) {
        state.seller.isAuth = true;
        state.seller.meanOfLogin = payload.meanOfLogin;
        state.seller.pin = payload.pin;
        state.seller.id = payload.id;
        state.seller.token = payload.token;
        state.seller.firstname = payload.firstname;
        state.seller.lastname = payload.lastname;
        state.seller.canSell = payload.canSell;
        state.seller.canReload = payload.canReload;
        state.seller.canAssign = payload.canAssign;
        state.seller.canControl = payload.canControl;
    },

    SET_GROUPS(state, groups) {
        state.groups = groups;
    },

    UPDATE_TOKEN(state, token) {
        state.seller.token = token;
    },

    ID_BUYER(state, payload) {
        state.buyer.isAuth = true;
        state.buyer.id = payload.id;
        state.buyer.credit = payload.credit;
        state.buyer.firstname = payload.firstname;
        state.buyer.lastname = payload.lastname;
        state.buyer.memberships = payload.memberships;
        state.buyer.purchases = payload.purchases;
    },

    OVERRIDE_BUYER_CREDIT(state, credit) {
        state.buyer.credit = credit;
    },

    LOGOUT_SELLER(state) {
        state.seller.isAuth = false;
    },

    FIRST_LOGOUT_SELLER(state) {
        state.seller.disconnectWarning = true;
    },

    REMOVE_LOGOUT_WARNING(state) {
        state.seller.disconnectWarning = false;
    },

    LOGOUT_BUYER(state) {
        state.buyer.isAuth = false;
        state.buyer.credit = 0;
    },

    SET_ALERT(state, alert) {
        state.alert = alert;
    },

    CLOSE_ALERT(state) {
        state.alert = null;
    }
};

export default { state: initialState, mutations };
