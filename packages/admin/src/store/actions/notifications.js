/**
 * Notifications actions
 */

export function notify({ commit }, message) {
    commit('UPDATENOTIFY', message);
}

export function notifyError({ commit }, error) {
    commit('UPDATEERROR', error);
}
