export const resetState = ({ commit }) => {
    commit('RESET_AUTH_STATE');
    commit('RESET_BASKET_STATE');
    commit('RESET_ITEMS_STATE');
    commit('RESET_ONLINE_STATE');
    commit('RESET_RELOAD_STATE');
    commit('RESET_UI_STATE');
};

export const startChangeApi = ({ commit }, payload) => {
    commit('SET_CHANGE_API', payload);
};

export const setupClient = ({ commit, dispatch }) => {
    commit('SET_DATA_LOADED', false);

    return dispatch('setupSocket')
        .then(() => dispatch('checkDevice'))
        .then(() =>
            Promise.all([
                dispatch('initQueue'),
                dispatch('updateEssentials'),
                dispatch('updateStoredItems'),
                dispatch('updateUsersData')
            ])
        )
        .then(() => commit('SET_DATA_LOADED', true));
};

export const checkApi = ({ dispatch }, payload) => {
    return dispatch('sendRequest', {
        url: `${payload}/auth/checkDevice`,
        noQueue: true,
        forceOnline: true
    }).catch(err => (err.message === 'Network Error' ? Promise.reject() : Promise.resolve()));
};

export const setApi = ({ state, commit, dispatch }, payload) => {
    const newHistory = {};
    for (let [key, value] of Object.entries(state.history)) {
        newHistory[key] = value;
    }

    commit('CHANGE_API', {
        api: state.device.api,
        history: newHistory
    });

    commit('SET_API', payload);

    const memorizedApi = state.device.apis[payload];
    if (memorizedApi) {
        commit('SET_HISTORY_STATE', memorizedApi.history);
        commit('SET_PRIVATEKEY', memorizedApi.privateKey);
        dispatch('setDeviceConfig', memorizedApi.config);
    } else {
        commit('RESET_HISTORY_STATE');
        commit('SET_PRIVATEKEY', null);
        dispatch('setDeviceConfig', null);
    }

    return dispatch('resetState')
        .then(() => window.database.wipe())
        .then(() => dispatch('setupClient'));
};

export const setDeviceConfig = ({ commit }, payload) => {
    // Used by electron, cordova...
    window.config = payload;
    commit('SET_DEVICECONFIG', payload);
};

export const checkDevice = ({ state, commit, dispatch }) =>
    dispatch('sendRequest', {
        url: 'auth/checkDevice',
        offlineAnswer: { data: { name: state.auth.device.name, authorized: true } },
        forceOnline: true,
        noQueue: true
    })
        .catch(() =>
            dispatch('sendRequest', {
                method: 'post',
                url: 'auth/registerDevice',
                offlineAnswer: { data: { name: state.auth.device.name, authorized: true } },
                forceOnline: true,
                noQueue: true
            })
        )
        .catch(() => ({
            data: {
                name: state.auth.device.name,
                authorized: false
            }
        }))
        .then(device => {
            commit('SET_DEVICE_NAME', device.data.name);

            if (device.data.newPrivateKey) {
                commit('SET_PRIVATEKEY', device.data.newPrivateKey);
                dispatch('setDeviceConfig', device.data.config);
                commit('CHANGE_API', {
                    api: state.device.api,
                    privateKey: device.data.newPrivateKey,
                    config: device.data.config
                });
            }

            if (!device.data.authorized) {
                commit('SET_PRIVATEKEY', null);
            }

            return !!device.data.authorized;
        });
