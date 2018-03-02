import { get, post, updateBearer } from '../../lib/fetch';

/**
 * Global actions
 */

export function updateLoggedUser({ commit }, loggedUser) {
    sessionStorage.setItem('user', JSON.stringify(loggedUser));
    commit('UPDATELOGGEDUSER', loggedUser);
}

export function updateLoggedUserField({ state, dispatch }, payload) {
    const newUser          = state.app.loggedUser;
    newUser[payload.field] = payload.value;
    dispatch('updateLoggedUser', newUser);
}

export function autoLoginUser({ commit, dispatch }) {
    if (sessionStorage.hasOwnProperty('token')) {
        commit('UPDATELOGGEDUSER', JSON.parse(sessionStorage.getItem('user')));
        dispatch('loadUser');
    }
}

export function loadHistory({ state, commit, dispatch }) {
    if (state.app.loggedUser) {
        get('history')
            .then((result) => {
                const newUser  = state.app.loggedUser;
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
    dispatch('initSocket', sessionStorage.getItem('token'));
    dispatch('loadHistory');
}

export function login({ dispatch }, credentials) {
    return post('login', credentials)
        .then((result) => {
            if (result.user) {
                sessionStorage.setItem('token', result.token);
                dispatch('updateLoggedUser', result.user);
                updateBearer(result.token);

                dispatch('loadUser');
                return result.user;
            }

            return Promise.reject();
        });
}
