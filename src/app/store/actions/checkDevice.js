export const setupClient = ({ dispatch }) =>
    dispatch('setupSocket')
        .then(() => dispatch('checkDevice'))
        .then(() => {
            dispatch('initQueue');
            dispatch('updateEssentials');
            dispatch('updateStoredItems');
            dispatch('updateUsersData');
        });

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
                return true;
            }

            if (!device.data.authorized) {
                commit('SET_PRIVATEKEY', null);
                return false;
            }
        });
