/**
 * Notifications actions
 */

export function notify({ commit }, notification) {
    if (typeof notification.json === 'function') {
        return notification.json().then(res => {
            commit('UPDATENOTIFY', { message: res.message });
        });
    }

    if (notification instanceof Error) {
        commit('UPDATENOTIFY', { message: notification.message });
    } else if (typeof notification.message === 'string') {
        commit('UPDATENOTIFY', { message: notification.message });
    } else {
        commit('UPDATENOTIFY', notification);
    }
}
