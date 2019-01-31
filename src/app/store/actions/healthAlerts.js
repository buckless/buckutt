export const sendHealthAlert = ({ state, dispatch, commit }, alert) => {
    alert = {
        ...alert,
        event_id: state.auth.device.event.id,
        point_id: state.auth.device.point.id,
        sender_id: state.auth.seller.id,
        location: state.auth.device.point.name
    };

    return dispatch('sendRequest', {
        method: 'post',
        url: 'crud/healthalerts',
        data: alert,
        offlineAnswer: {
            data: alert
        },
        immediate: true
    }).then(res => {
        commit('PUSH_ALERT', res.data);
    });
};

export const listHealthAlerts = ({ dispatch, commit }) => {
    return dispatch('sendRequest', {
        method: 'get',
        url: 'crud/healthalerts?deleted',
        offlineAnswer: {
            data: []
        },
        immediate: true
    }).then(res => {
        commit(
            'PUSH_ALERT',
            res.data.map(alert => {
                if (alert.deleted_at) {
                    alert.active = false;
                }

                return alert;
            })
        );
    });
};

export const closeHealthAlert = ({ dispatch, commit }, id) => {
    return dispatch('sendRequest', {
        method: 'delete',
        url: `crud/healthalerts/${id}`,
        offlineAnswer: {
            data: {}
        },
        immediate: true
    }).then(() => {
        commit('TOGGLE_ALERT', id);
    });
};

export const healthAlert = ({ commit }, alert) => {
    commit('PUSH_ALERT', alert);
};
