export const PUSH_NOTIFICATION = (state, message) => {
    state.currentId += 1;

    state.messages.push({ id: state.currentId, message });
};

export const CLEAR_NOTIFICATION = (state, index) => {
    state.messages = state.messages.filter(m => m.id !== index);
};
