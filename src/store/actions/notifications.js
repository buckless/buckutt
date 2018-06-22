const translateNotification = message => {
    switch (message) {
        case "Couldn't find ticket":
            return "Ce billet n'existe pas";
        case 'Physical support not found':
            return "Ce support n'existe pas";
        case 'Card already binded':
            return 'Cette carte appartient à déjà un autre compte';
        case 'Ticket already binded':
            return 'Ce billet appartient à déjà un autre compte';
        case 'Duplicate Entry':
            return 'Cette carte est déjà associée à votre compte';
        default:
            return message;
    }
};

/**
 * Notifications actions
 */

export function notify({ commit, dispatch }, notification) {
    if (typeof notification.json === 'function') {
        return notification.json().then(res => {
            commit('UPDATENOTIFY', { message: translateNotification(res.message) });
        });
    }

    if (notification instanceof Error) {
        commit('UPDATENOTIFY', { message: translateNotification(notification.message) });
    } else if (typeof notification.message === 'string') {
        commit('UPDATENOTIFY', { message: translateNotification(notification.message) });
    } else {
        commit('UPDATENOTIFY', notification);
    }
}
