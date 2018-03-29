import axios from 'axios';

export const interfaceLoader = (store, credentials) => {
    const token = store.getters.tokenHeaders;
    let params  = '';

    if (credentials) {
        params = `?buyer=${credentials.mol.trim()}&molType=${credentials.type}`;
    }

    const initialPromise = (!store.getters.isDegradedModeActive) ?
        axios.get(`${config.api}/services/items${params}`, token) :
        Promise.resolve({
            data: {
                ...store.state.online.offline.defaultItems,
                buyer: {
                    credit: credentials ? credentials.credit : null
                }
            }
        });

    return initialPromise
        .then((res) => {
            if (credentials && res.data.buyer && typeof res.data.buyer.credit === 'number') {
                store.commit('ID_BUYER', {
                    id       : res.data.buyer.id || '',
                    credit   : res.data.buyer.credit,
                    firstname: res.data.buyer.firstname || '',
                    lastname : res.data.buyer.lastname || '',
                    groups   : res.data.buyer.groups || [],
                    purchases: res.data.buyer.purchases || []
                });
                store.commit('SET_BUYER_MOL', credentials.mol.trim());
            }

            if (!res.data.buyer || !res.data.buyer.id) {
                // This will be call at least once when seller logs in
                // It will stores default items in case of disconnection
                store.dispatch('setDefaultItems', {
                    articles  : res.data.articles,
                    promotions: res.data.promotions
                });
            }

            if (res.data.articles) {
                store.commit('SET_ITEMS', res.data.articles);
            }

            if (res.data.promotions) {
                store.commit('SET_PROMOTIONS', res.data.promotions);
            }

            return store.dispatch('createTabs');
        })
        .then(() => store.dispatch('createTabsItems'))
        .catch((err) => {
            if (err.message === 'Network Error') {
                store.commit('ERROR', { message: 'Server not reacheable' });
                return;
            }

            if (err.response.data
                && err.response.data.message === 'Buyer not found'
                && store.state.auth.device.event.config.useCardData
                && typeof credentials.credit === 'number') {
                store.commit('ID_BUYER', {
                    id       : '',
                    credit   : credentials.credit,
                    firstname: '',
                    lastname : '',
                    groups   : [],
                    purchases: []
                });
                store.commit('SET_BUYER_MOL', credentials.mol.trim());
                return;
            }

            store.commit('ERROR', err.response.data);
        });
};

export const clearInterface = (store) => {
    store.commit('CLEAR_ITEMS');
    store.commit('CLEAR_TABSITEMS');
    store.commit('CLEAR_CATEGORIES');
    store.commit('CLEAR_PROMOTIONS');
};
