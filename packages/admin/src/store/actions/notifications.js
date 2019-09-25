/**
 * Notifications actions
 */

export function notify({ state, commit }, message) {
    commit('NOTIFY', message);

    const id = state.notifications.currentId - 1;

    setTimeout(() => commit('REMOVE_NOTIFICATION', id), 4000);
}
