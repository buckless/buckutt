import { get, post, updateBearer } from '../../lib/fetch';

/**
 * Global actions
 */

export function setToken(_, token) {
    updateBearer(token);
    if (token) {
        localStorage.setItem('manager-token', token);
    } else {
        localStorage.removeItem('manager-token');
    }
}

export function logoutUser({ dispatch }) {
    dispatch('clearHistory');
    dispatch('setToken');
    dispatch('updateLoggedUser');
    dispatch('closeSocket');
    localStorage.removeItem('manager-token', null);
    localStorage.removeItem('manager-user', null);
    localStorage.removeItem('manager-linkedusers', null);
}

export function updateLoggedUser({ commit }, loggedUser) {
    localStorage.setItem('manager-user', JSON.stringify(loggedUser));
    commit('UPDATELOGGEDUSER', loggedUser);
}

export function updateLoggedUserField({ state, dispatch }, payload) {
    const newUser = state.app.loggedUser;
    newUser[payload.field] = payload.value;
    dispatch('updateLoggedUser', newUser);
}

export function autoLoginUser({ commit, dispatch }) {
    if (localStorage.hasOwnProperty('manager-token')) {
        commit('UPDATELOGGEDUSER', JSON.parse(localStorage.getItem('manager-user')));
        commit('UPDATELINKEDUSERS', JSON.parse(localStorage.getItem('manager-linkedusers')));
        dispatch('setToken', localStorage.getItem('manager-token'));
        dispatch('loadUser');
    }
}

export function loadHistory({ state, commit, dispatch }) {
    if (state.app.loggedUser) {
        get('history').then(result => {
            const newUser = state.app.loggedUser;
            newUser.credit = result.credit;

            dispatch('updateLoggedUser', newUser);
            commit('REPLACEHISTORY', result.history.filter(entry => !entry.isRemoved));
            commit('SET_PENDING_AMOUNT', result.pending);
        });
    }
}

export function clearHistory({ commit }) {
    commit('CLEARHISTORY');
}

export function loadUser({ dispatch }) {
    dispatch('initSocket', localStorage.getItem('manager-token'));
    dispatch('loadHistory');
    dispatch('loadGiftReloads');
}

export function loadGiftReloads({ commit }) {
    get('giftReloads').then(result => {
        commit('SET_GIFT_RELOADS', result);
    });
}

export function login({ dispatch, commit }, credentials) {
    return post('login', credentials).then(result => {
        if (result.user) {
            dispatch('setToken', result.token);
            dispatch('updateLoggedUser', result.user);

            dispatch('loadUser');

            commit('UPDATELINKEDUSERS', result.linkedUsers);
            commit('SETCARDCOST', result.cardCost ? result.cardCost : 0);

            localStorage.setItem('manager-linkedusers', JSON.stringify(result.linkedUsers));

            return result.user;
        }

        return Promise.reject();
    });
}

export function switchUser({ dispatch, commit }, credentials) {
    return post('switchuser', credentials).then(result => {
        if (result.user) {
            dispatch('setToken', result.token);
            dispatch('updateLoggedUser', result.user);
            dispatch('loadUser');

            return;
        }

        return Promise.reject();
    });
}
