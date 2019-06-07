export const confirmReloadModal = ({ commit }) => {
    commit('CONFIRM_RELOAD_MODAL');
};

export const cancelReloadModal = ({ commit }) => {
    commit('CANCEL_RELOAD_MODAL');
};

export const closeReloadModal = ({ commit }) => {
    commit('CLOSE_RELOAD_MODAL');
    commit('CHANGE_MEAN_OF_PAYMENT', 'card');
};

export const changeMeanOfPayment = ({ commit }, meanOfPayment) => {
    commit('CHANGE_MEAN_OF_PAYMENT', meanOfPayment);
};

export const addReload = ({ commit }, reload) => {
    commit('ADD_RELOAD', reload);
};

export const addRefund = ({ commit }, refund) => {
    commit('ADD_REFUND', refund);
};

export const removeReloads = ({ commit }) => {
    commit('REMOVE_RELOADS');
};

export const removeRefunds = ({ commit }) => {
    commit('REMOVE_REFUNDS');
};

export const setMeansOfPayment = ({ commit }, meansOfPayment) => {
    commit('SET_MEANS_OF_PAYMENT', meansOfPayment);
};
