export const tokenHeader = state => (state.token ? { Authorization: `Bearer ${state.token}` } : {});
