import Vue from 'vue';

const models = [
    'accesses',
    'alerts',
    'articles',
    'categories',
    'devices',
    'events',
    'fundations',
    'giftreloads',
    'groups',
    'meansofpayment',
    'memberships',
    'periods',
    'points',
    'prices',
    'promotions',
    'purchases',
    'refunds',
    'reloads',
    'rights',
    'sets',
    'users',
    'wallets',
    'webservices',
    'wikets',
    'withdrawals'
];

const state = {};
models.forEach(name => {
    state[name] = { values: {}, allIds: [] };
});

const mutations = {
    CLEARAPPSTORE(state_) {
        Object.keys(state_).forEach(key => {
            state_[key] = { values: {}, allIds: [] };
        });
    },

    CLEAROBJECT(state_, object) {
        state_[object] = { values: {}, allIds: [] };
    },

    SETOBJECTS(state_, data) {
        data.objects.forEach(entry => {
            if (state_[data.route].allIds.indexOf(entry.id) === -1) {
                Vue.set(state_[data.route].values, entry.id, entry);
                state_[data.route].allIds.push(entry.id);
                return;
            }

            // The API always return the most accurate data about relations -> override the whole array
            // If no relations are returned, keep the old ones
            Vue.set(state_[data.route].values, entry.id, {
                ...state_[data.route].values[entry.id],
                ...entry
            });
        });
    },

    DELETEOBJECTS(state_, data) {
        data.objects.forEach(entry => {
            delete state_[data.route].values[entry.id];

            const i = state_[data.route].allIds.indexOf(entry.id);
            if (i > -1) {
                state_[data.route].allIds.splice(i, 1);
            }
        });
    }
};

export default {
    state,
    mutations
};
