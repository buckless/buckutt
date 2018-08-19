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
