let Dexie = require('dexie');

Dexie = Dexie.default ? Dexie.default : Dexie;

class OfflineData {
    constructor() {
        this.db = new Dexie('buckless.db');
    }

    init() {
        this.db.version(1).stores({
            tickets: 'id,barcode,userId,name,username,credit,physicalId',
            accesses: 'id,userId,cardId,groupId,start,end',
            pendingCardUpdates: 'id,incrId,userId,cardId,amount',
            images: 'id,blob'
        });

        return Promise.resolve();
    }

    setImage(id, blob) {
        return this.db.images.put({ id, blob });
    }

    getImage(id) {
        return this.db.images.get(id);
    }

    close() {
        this.db.close();
        return Promise.resolve();
    }

    empty(table) {
        return this.db[table].clear();
    }

    listTickets() {
        return this.db.tickets.toArray();
    }

    find(input) {
        const reg = new RegExp(`(.*)${input}(.*)`, 'i');

        return this.db.tickets
            .filter(
                user => reg.test(user.name) || user.barcode === input || user.physicalId === input
            )
            .limit(5)
            .toArray();
    }

    findByName(name) {
        const reg = new RegExp(`(.*)${name}(.*)`, 'i');

        return this.db.tickets
            .filter(user => reg.test(user.name))
            .limit(5)
            .toArray();
    }

    findByBarcode(barcode) {
        return (
            this.db.tickets
                // user.username === barcode is when user scan their manager qrcode
                .filter(
                    user =>
                        user.barcode === barcode ||
                        user.username === barcode ||
                        user.physicalId === barcode
                )
                .limit(1)
                .toArray()
        );
    }

    userMemberships(userId) {
        return this.db.accesses.filter(access => access.userId === userId).toArray();
    }

    cardAccesses(cardId) {
        return this.db.accesses.filter(access => access.cardId === cardId).toArray();
    }

    pendingCardUpdates(cardId) {
        return this.db.pendingCardUpdates.filter(pcu => pcu.cardId === cardId).toArray();
    }

    pendingUserUpdates(userId) {
        return this.db.pendingCardUpdates.filter(pcu => pcu.userId === userId).toArray();
    }

    insert(table, data) {
        if (Array.isArray(data)) {
            return this.db[table].bulkAdd(data);
        }

        return this.db[table].add(data);
    }

    delete(table, keys) {
        if (Array.isArray(keys)) {
            return this.db[table].bulkDelete(keys);
        }

        return this.db[table].delete(keys);
    }
}

export default OfflineData;
