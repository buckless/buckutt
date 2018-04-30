import axios from '@/utils/axios';

let lock = false;

export const updateEssentials = (store, force) => {
    if (lock || store.getters.isDegradedModeActive) {
        return Promise.resolve();
    }

    lock = true;

    return axios.get(`${config.api}/services/deviceEssentials`, store.getters.tokenHeaders)
        .then(res => {
            if (!store.state.auth.device.point.id || store.state.auth.seller.canAssign || force) {
                return store
                    .dispatch('setPoint', {
                        id: res.headers.device,
                        wiket: res.headers.wiket,
                        point: {
                            id: res.headers.point,
                            name: res.headers.pointname
                        },
                        event: {
                            id: res.headers.event,
                            name: res.headers.eventname
                        }
                    })
                    .then(() => res);
            }

            return Promise.resolve(res);
        })
        .then(res => {
            const promises = [];

            if (res.data.operators) {
                promises.push(store.dispatch('setSellers', res.data.operators));
            }

            if (res.data.giftReloads) {
                promises.push(store.dispatch('setGiftReloads', res.data.giftReloads));
            }

            if (res.data.device) {
                promises.push(store.dispatch('setFullDevice', res.data.device));
            }

            if (res.data.event) {
                promises.push(store.dispatch('setEvent', res.data.event));
            }

            if (res.data.meansOfPayment) {
                promises.push(store.dispatch('setMeansOfPayment', res.data.meansOfPayment));
            }

            if (res.data.groups) {
                promises.push(store.dispatch('setGroups', res.data.groups));
            }

            if (res.data.nfcCosts) {
                promises.push(store.dispatch('setNfcCosts', res.data.nfcCosts));
            }

            if (res.data.userTickets) {
                const users = res.data.userTickets.map(user => [
                    user.id,
                    user.fullname,
                    user.username,
                    user.ticket,
                    user.credit
                ]);

                promises.push(
                    window.database.empty('users').then(() => window.database.insert('users', users))
                );
            }

            if (res.data.accesses) {
                const accesses = res.data.accesses.map((access, i) => [
                    i + 1,
                    access.cardId,
                    access.groupId,
                    access.start,
                    access.end
                ]);

                promises.push(
                    window.database
                        .empty('accesses')
                        .then(() => window.database.insert('accesses', accesses))
                );
            }

            return Promise.all(promises);
        })
        .then(() => console.log('Offline data updated'))
        .catch(err => console.log(err))
        .then(() => {
            lock = false;
        });
};
