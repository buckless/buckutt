export const interfaceLoader = (store, credentials) => {
    let params = '';
    let offlineAnswer = { data: store.state.online.offline.defaultItems };

    if (credentials) {
        params = `?buyer=${credentials.mol.trim()}&molType=${credentials.type}`;
        offlineAnswer = window.database.cardAccesses(credentials.mol.trim()).then(memberships => ({
            data: {
                ...store.state.online.offline.defaultItems,
                buyer: {
                    credit: credentials ? credentials.credit : null,
                    memberships: memberships
                        .concat([
                            {
                                group: store.state.auth.device.event.defaultGroup_id,
                                start: new Date(0),
                                end: new Date(21474000000000)
                            }
                        ])
                        .map(membership => ({
                            group_id: membership.group,
                            period: {
                                start: membership.start,
                                end: membership.end
                            }
                        }))
                }
            }
        }));
    }

    store
        .dispatch('sendRequest', {
            url: `/services/items${params}`,
            offlineAnswer,
            noQueue: true
        })
        .then(res => {
            if (credentials && res.data.buyer && typeof res.data.buyer.credit === 'number') {
                const memberships = res.data.buyer.memberships.map(membership => ({
                    start: membership.period.start,
                    end: membership.period.end,
                    group: membership.group_id
                }));

                const credit =
                    typeof credentials.credit === 'number'
                        ? credentials.credit
                        : res.data.buyer.credit;

                store.commit('ID_BUYER', {
                    id: res.data.buyer.id || '',
                    credit,
                    firstname: res.data.buyer.firstname || '',
                    lastname: res.data.buyer.lastname || '',
                    memberships,
                    purchases: res.data.buyer.purchases || []
                });
                store.commit('SET_BUYER_MOL', credentials.mol.trim());
            }

            if (!res.data.buyer || !res.data.buyer.id) {
                // This will be call at least once when seller logs in
                // It will stores default items in case of disconnection
                store.dispatch('setDefaultItems', {
                    articles: res.data.articles,
                    promotions: res.data.promotions
                });
            }

            if (res.data.articles) {
                store.commit('SET_ITEMS', res.data.articles);
            }

            if (res.data.promotions) {
                store.commit('SET_PROMOTIONS', res.data.promotions);
            }

            if (store.getters.tabs.length > 0) {
                store.commit('CHANGE_TAB', store.getters.tabs[0].id);
            }
        })
        .catch(err => {
            if (err.message === 'Network Error') {
                store.commit('ERROR', { message: 'Server not reacheable' });
                return;
            }

            if (
                err.response.data &&
                err.response.data.message === 'Buyer not found' &&
                store.state.auth.device.event.config.useCardData &&
                typeof credentials.credit === 'number'
            ) {
                store.commit('ID_BUYER', {
                    id: '',
                    credit: credentials.credit,
                    firstname: '',
                    lastname: '',
                    memberships: [],
                    purchases: []
                });
                store.commit('SET_BUYER_MOL', credentials.mol.trim());
                return;
            }

            store.commit('ERROR', err.response.data);
        });
};

export const clearInterface = store => {
    store.commit('CLEAR_ITEMS');
    store.commit('CLEAR_PROMOTIONS');
};
