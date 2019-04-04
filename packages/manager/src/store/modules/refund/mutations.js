export const SET_ALLOWED = (state, payload) => {
    state.allowed = payload;
};

export const SET_ALREADY_ASKED = (state, payload) => {
    state.alreadyAsked = payload;
};

export const SET_REFUNDABLE = (state, payload) => {
    state.refundable = payload;
};

export const SET_START = (state, payload) => {
    state.start = payload;
};

export const SET_END = (state, payload) => {
    state.end = payload;
};

export const SET_MINIMUM = (state, payload) => {
    state.minimum = payload;
};

export const SET_CARD_REGISTERED = (state, payload) => {
    state.cardRegistered = payload;
};