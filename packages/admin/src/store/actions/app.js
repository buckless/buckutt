/**
 * Global actions
 */

export function updateLoggedUser({ commit }, loggedUser) {
    commit('UPDATELOGGEDUSER', loggedUser);
}

export function load({ dispatch }) {
    const routes = [
        'points',
        'devices',
        'periods',
        'articles',
        'fundations',
        'groups',
        'categories',
        'promotions',
        'sets',
        'events',
        'meansofpayment',
        'webservices',
        'alerts',
        'giftreloads'
    ];

    dispatch('initSocket', localStorage.getItem('token'));

    return Promise.all(routes.map(route => dispatch('fetchObjects', { route })));
}

export const checkAndCreateNeededRouterData = async ({ state, commit, dispatch }, route) => {
    if (state.app.firstLoad) {
        return Promise.resolve();
    }

    if (localStorage.hasOwnProperty('token')) {
        commit('UPDATELOGGEDUSER', JSON.parse(localStorage.getItem('user')));
        dispatch('setToken', localStorage.getItem('token'));
        await dispatch('load');
    }

    return dispatch('loadFocusedElements', route.params);
};
