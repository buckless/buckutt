// Locks are duplicated locally to ensure that persistent doesn't lock updates forever in case of page refresh
let lockUsers = false;
let loopUsers;

export const processInsertDelete = (store, payload) => {
    // Can only be triggered when updateUsersData is running
    if (!lockUsers) {
        return Promise.resolve();
    }

    let prepareTable = Promise.resolve();

    if (!store.state.online.lastUsersUpdate) {
        prepareTable = window.database.empty(payload.table);
    }

    const deleted = payload.data.insert
        .map(ins => ins.id)
        .concat(payload.data.delete.map(del => del.id));

    return (
        prepareTable
            // First, delete updated (as insert or update doesn't exists in Dexie) and deleted data
            .then(() => window.database.delete(payload.table, deleted))
            // Then, add the updated data
            .then(() =>
                window.database.insert(payload.table, payload.data.insert)
            )
    );
};

export const updateUsersData = store => {
    if (lockUsers) {
        return Promise.resolve();
    }

    lockUsers = true;
    store.commit("LOCK_USERS_UPDATE", true);
    clearTimeout(loopUsers);

    let params = "";
    if (store.state.online.lastUsersUpdate) {
        params = `?lastUpdate=${store.state.online.usersData.lastUpdate.toISOString()}`;
    }

    let lastUpdate;

    return store
        .dispatch("sendRequest", {
            url: `services/usersData${params}`,
            noQueue: true
        })
        .then(res => {
            const promises = [];
            lastUpdate = new Date(res.data.time);

            if (res.data.blockedCards) {
                promises.push(
                    store.dispatch("setBlockedCards", res.data.blockedCards)
                );
            }

            // PCU, accesses and tickets are directly managed by Dexie for performance issues
            if (res.data.pendingCardUpdates) {
                promises.push(
                    store.dispatch("processInsertDelete", {
                        table: "pendingCardUpdates",
                        data: res.data.pendingCardUpdates
                    })
                );
            }

            if (res.data.accesses) {
                promises.push(
                    store.dispatch("processInsertDelete", {
                        table: "accesses",
                        data: res.data.accesses
                    })
                );
            }

            if (res.data.tickets) {
                promises.push(
                    store.dispatch("processInsertDelete", {
                        table: "tickets",
                        data: res.data.tickets
                    })
                );
            }

            return Promise.all(promises);
        })
        .catch(err => console.log(err))
        .then(() => {
            // Poll every 5 minutes
            if (lastUpdate) {
                store.commit("SET_LAST_USERS_UPDATE", lastUpdate);
            }

            loopUsers = setTimeout(
                () => store.dispatch("updateUsersData"),
                5 * 60 * 1000
            );
            lockUsers = false;
            store.commit("LOCK_USERS_UPDATE", false);
        });
};

let lockItems = false;
let loopItems;

export const updateStoredItems = store => {
    if (lockItems) {
        return Promise.resolve();
    }

    lockItems = true;
    store.commit("LOCK_ITEMS_UPDATE", true);
    clearTimeout(loopItems);

    return store
        .dispatch("sendRequest", {
            url: "services/items",
            noQueue: true
        })
        .then(res =>
            store.dispatch("setDefaultItems", {
                articles: res.data.articles,
                promotions: res.data.promotions
            })
        )
        .catch(err => console.log(err))
        .then(() => {
            // Poll every 10 minutes
            store.commit("SET_LAST_ITEMS_UPDATE", new Date());

            loopItems = setTimeout(
                () => store.dispatch("updateStoredItems"),
                10 * 60 * 1000
            );
            lockItems = false;
            store.commit("LOCK_ITEMS_UPDATE", false);
        });
};

let lockEvent = false;
let loopEvent;

export const updateEssentials = (store, force) => {
    if (lockEvent) {
        return Promise.resolve();
    }

    lockEvent = true;
    store.commit("LOCK_ESSENTIALS_UPDATE", true);
    clearTimeout(loopEvent);

    return store
        .dispatch("sendRequest", {
            url: "services/eventEssentials",
            noQueue: true
        })
        .then(res => {
            if (
                !store.state.auth.device.point.id ||
                !store.state.auth.seller.isAuth ||
                force
            ) {
                return store
                    .dispatch("setPoint", {
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
                promises.push(store.dispatch("setSellers", res.data.operators));
            }

            if (res.data.giftReloads) {
                promises.push(
                    store.dispatch("setGiftReloads", res.data.giftReloads)
                );
            }

            if (res.data.device) {
                promises.push(store.dispatch("setFullDevice", res.data.device));
            }

            if (res.data.event) {
                promises.push(store.dispatch("setEvent", res.data.event));
            }

            if (res.data.meansOfPayment) {
                promises.push(
                    store.dispatch("setMeansOfPayment", res.data.meansOfPayment)
                );
            }

            if (res.data.groups) {
                promises.push(store.dispatch("setGroups", res.data.groups));
            }

            if (res.data.nfcCosts) {
                promises.push(store.dispatch("setNfcCosts", res.data.nfcCosts));
            }

            return Promise.all(promises);
        })
        .then(() => console.log("Event data updated"))
        .catch(err => console.log(err))
        .then(() => {
            // Poll every 20 minutes
            store.commit("SET_LAST_ESSENTIALS_UPDATE", new Date());

            loopEvent = setTimeout(
                () => store.dispatch("updateEssentials"),
                20 * 60 * 1000
            );
            lockEvent = false;
            store.commit("LOCK_ESSENTIALS_UPDATE", false);
        });
};
