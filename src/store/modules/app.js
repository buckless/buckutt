const state = {
    loggedUser: null,
    loggedLinkedUsers: [],
    history: [],
    users: [],
    giftReloads: [],
    pending: 0,
    refund: {
        allowed: false,
        alreadyAsked: false,
        end: new Date('1970-01-01T01:00:00.000Z'),
        refundable: 0,
        start: new Date('1970-01-01T01:00:00.000Z')
    }
};

const mutations = {
    UPDATELOGGEDUSER(state_, loggedUser) {
        state_.loggedUser = loggedUser;
    },

    UPDATELINKEDUSERS(state_, linkedUsers) {
        state_.loggedLinkedUsers = linkedUsers;
    },

    ADDHISTORY(state_, data) {
        state_.history.push(...data);
    },

    REPLACEHISTORY(state_, data) {
        // empty the array
        state_.history.splice(0, state_.history.length);

        state_.history.push(...data);
    },

    CLEARHISTORY(state_) {
        state_.history = [];
    },

    CHANGEUSERS(state_, users) {
        state_.users = users;
    },

    SET_PENDING_AMOUNT(state_, pending) {
        state_.pending = pending;
    },

    SET_GIFT_RELOADS(state_, giftReloads) {
        state_.giftReloads = giftReloads;
    },

    SET_REFUNDABLE(state_, payload) {
        state_.refund = payload;
        state_.refund.end = state_.refund.end ? new Date(state_.refund.end) : null;
        state_.refund.start = state_.refund.start ? new Date(state_.refund.start) : null;
    }
};

export default {
    state,
    mutations
};
