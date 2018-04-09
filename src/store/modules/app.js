const state = {
    focusedElements: [],
    currentEvent: null,
    loggedUser: null,
    firstLoad: false,
    creationData: {}
};

const mutations = {
    UPDATEFOCUSEDELEMENT(state_, payload) {
        if (state_.focusedElements[payload.depth]) {
            state_.focusedElements.splice(payload.depth, 1, payload.value);
        } else {
            state_.focusedElements[payload.depth] = payload.value;
        }
    },

    CLEARFOCUSEDELEMENTS(state_) {
        state_.focusedElements = [];
    },

    TRIMFOCUSEDELEMENTS(state_, keepLength) {
        state_.focusedElements = state_.focusedElements.filter((_, index) => index < keepLength);
    },

    UPDATECURRENTEVENT(state_, currentEvent) {
        state_.currentEvent = currentEvent;
    },

    UPDATELOGGEDUSER(state_, loggedUser) {
        state_.loggedUser = loggedUser;
    },

    UPDATEFIRSTLOAD(state_, firstLoad) {
        state_.firstLoad = firstLoad;
    },

    UPDATECREATIONDATA(state_, creationData) {
        state_.creationData = creationData;
    }
};

export default {
    state,
    mutations
};
