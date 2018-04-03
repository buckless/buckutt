import axios         from '@/utils/axios';
import hasEssentials from '@/utils/offline/hasEssentials';
import OfflineData   from '@/../lib/offlineData';

let assignedUsers = false;
let lock          = false;

export const updateEssentials = (store, force) => {
    if (lock || store.getters.isDegradedModeActive) {
        return Promise.resolve();
    }

    lock              = true;
    const offlineData = new OfflineData();

    return offlineData.init()
        .then(() => axios.get(`${config.api}/services/deviceEssentials`, store.getters.tokenHeaders))
        .then((res) => {
            if (!store.state.auth.device.point.id || store.state.auth.seller.canAssign || force) {
                return store.dispatch('setPoint', {
                    id   : res.headers.device,
                    wiket: res.headers.wiket,
                    point: {
                        id  : res.headers.point,
                        name: res.headers.pointname
                    },
                    event: {
                        id  : res.headers.event,
                        name: res.headers.eventname
                    }
                })
                .then(() => res);
            }

            return Promise.resolve(res);
        })
        .then((res) => {
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

            if (res.data.userTickets) {
                const users = res.data.userTickets.map(user => [
                    user.id,
                    user.fullname,
                    user.ticket,
                    user.credit
                ]);

                promises.push(
                    offlineData.empty('users')
                        .then(() => offlineData.insert('users', users))
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
                    offlineData.empty('accesses')
                        .then(() => offlineData.insert('accesses', accesses))
                );
            }

            return Promise.all(promises);
        })
        .then(() => {
            window.db = offlineData;
            console.log('Offline data updated');
        })
        .catch((err) => {
            console.log(err);

            if (err.message === 'Network Error') {
                if (!hasEssentials()) {
                    store.commit('ERROR', { message: 'This device doesn\'t meet the minimal requirements to run offline.' });
                    return;
                }

                return;
            }
        })
        .then(() => {
            lock = false;
        });
};
