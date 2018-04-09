import { post, updateBearer } from '../../lib/fetch';
import { isAdmin } from '../../lib/isAdmin.js';

/**
 * Home actions
 */

export function login({ commit, dispatch }, credentials) {
    return post('services/login', credentials).then(result => {
        if (!isAdmin(result.user)) {
            return Promise.reject(new Error('You are not administrator'));
        }

        localStorage.setItem('user', JSON.stringify(result.user));

        commit('UPDATELOGGEDUSER', result.user);
        dispatch('setToken', result.token);
        dispatch('load');
    });
}

export function setToken(_, token) {
    updateBearer(token);
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
}

export function logoutUser({ dispatch }) {
    dispatch('clearAppStore');
    dispatch('setToken');
    dispatch('updateLoggedUser');
    dispatch('closeSocket');
    localStorage.clear();
}
