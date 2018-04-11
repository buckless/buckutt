import { get, post, updateBearer } from '../../lib/fetch';

/**
 * Global actions
 */

export function setToken(_, token) {
    updateBearer(token);
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
}

export function logoutUser({ dispatch }) {
    dispatch('clearHistory');
    dispatch('setToken');
    dispatch('updateLoggedUser');
    dispatch('closeSocket');
    localStorage.clear();
}

export function updateLoggedUser({ commit }, loggedUser) {
    localStorage.setItem('user', JSON.stringify(loggedUser));
    commit('UPDATELOGGEDUSER', loggedUser);
}

export function updateLoggedUserField({ state, dispatch }, payload) {
    const newUser = state.app.loggedUser;
    newUser[payload.field] = payload.value;
    dispatch('updateLoggedUser', newUser);
}

export function autoLoginUser({ commit, dispatch }) {
    if (localStorage.hasOwnProperty('token')) {
        commit('UPDATELOGGEDUSER', JSON.parse(localStorage.getItem('user')));
        dispatch('setToken', localStorage.getItem('token'));
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
    dispatch('initSocket', localStorage.getItem('token'));
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
            commit('SETCARDCOST', result.cardCost ? result.cardCost : 0);
            dispatch('loadUser');
            return result.user;
        }

        return Promise.reject();
    });
}
