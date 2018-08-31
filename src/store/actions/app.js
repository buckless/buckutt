/**
 * Global actions
 */

export function updateLoggedUser({ commit }, loggedUser) {
    commit('UPDATELOGGEDUSER', loggedUser);
}

export function updateCreationData({ commit }, creationData) {
    commit('UPDATECREATIONDATA', creationData);
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
        'accesses',
        'giftreloads'
    ];

    dispatch('initSocket', localStorage.getItem('token'));

    const objectsToFetch = routes.map(route => dispatch('fetchObjects', { route }));

    Promise.all(objectsToFetch).then(() =>
        dispatch('fetchObjectsAndRelations', { route: 'events' })
    );
}

export function checkAndCreateNeededRouterData({ state, commit, dispatch }) {
    if (state.app.firstLoad) {
        return Promise.resolve();
    }

    const actions = [];

    if (localStorage.hasOwnProperty('token')) {
        commit('UPDATELOGGEDUSER', JSON.parse(localStorage.getItem('user')));
        dispatch('setToken', localStorage.getItem('token'));
        dispatch('load');
    }

    return Promise.all(actions)
        .then(() => {
            commit('UPDATEFIRSTLOAD', true);
            return Promise.resolve();
        })
        .catch(() => Promise.reject());
}
