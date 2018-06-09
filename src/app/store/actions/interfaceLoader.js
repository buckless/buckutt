export const interfaceLoader = (store, payload = {}) => {
    let params = '';
    let offlineAnswer = { data: store.state.online.offline.defaultItems };

    if (payload.mol) {
        params = `?buyer=${payload.mol.trim()}&molType=${payload.type}`;
        offlineAnswer = window.database.cardAccesses(payload.mol.trim()).then(memberships => ({
            data: {
                ...store.state.online.offline.defaultItems,
                buyer: {
                    credit: payload ? payload.credit : null,
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

    return store
        .dispatch('sendRequest', {
            url: `/services/items${params}`,
            offlineAnswer,
            noQueue: true,
            forceOffline: payload.forceOffline
        })
        .then(res => {
            if (payload.mol && res.data.buyer && typeof res.data.buyer.credit === 'number') {
                const memberships = res.data.buyer.memberships.map(membership => ({
                    start: membership.period.start,
                    end: membership.period.end,
                    group: membership.group_id
                }));

                const credit =
                    typeof payload.credit === 'number' ? payload.credit : res.data.buyer.credit;

                store.commit('ID_BUYER', {
                    id: res.data.buyer.id || '',
                    credit,
                    firstname: res.data.buyer.firstname || '',
                    lastname: res.data.buyer.lastname || '',
                    memberships,
                    purchases: res.data.buyer.purchases || []
                });
                store.commit('SET_BUYER_MOL', payload.mol.trim());
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
                typeof payload.credit === 'number'
            ) {
                store.commit('ID_BUYER', {
                    id: '',
                    credit: payload.credit,
                    firstname: '',
                    lastname: '',
                    memberships: [],
                    purchases: []
                });
                store.commit('SET_BUYER_MOL', payload.mol.trim());
                return;
            }

            store.commit('ERROR', err.response.data);
        });
};

export const clearInterface = store => {
    store.commit('CLEAR_ITEMS');
    store.commit('CLEAR_PROMOTIONS');
};
