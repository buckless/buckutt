const state = {
    points: [],
    devices: [],
    periods: [],
    articles: [],
    fundations: [],
    groups: [],
    categories: [],
    promotions: [],
    sets: [],
    events: [],
    users: [],
    transfers: [],
    reloads: [],
    refunds: [],
    purchases: [],
    withdrawals: [],
    meansofpayment: [],
    rights: [],
    webservices: [],
    history: [],
    alerts: [],
    accesses: [],
    giftreloads: []
};

const mutations = {
    CLEARAPPSTORE(state_) {
        Object.keys(state_).forEach(key => {
            state_[key] = [];
        });
    },

    CLEAROBJECT(state_, object) {
        state_[object] = [];
    },

    ADDOBJECTS(state_, data) {
        state_[data.route].push(...data.objects);
    },

    UPDATEOBJECTS(state_, data) {
        data.objects.forEach(object => {
            const i = state_[data.route].findIndex(o => o.id === object.id);

            state_[data.route].splice(i, 1, object);
        });
    },

    DELETEOBJECTS(state_, data) {
        data.objects.forEach(object => {
            const i = state_[data.route].findIndex(o => o.id === object.id);

            state_[data.route].splice(i, 1);
        });
    }
};

export default {
    state,
    mutations
};
