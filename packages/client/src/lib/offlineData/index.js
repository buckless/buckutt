let Dexie = require('dexie');

Dexie = Dexie.default ? Dexie.default : Dexie;

class OfflineData {
    constructor() {
        this.db = new Dexie(`buckless.db`);
    }

    init() {
        this.db.version(1).stores({
            tickets: 'id,walletId,ticketId,barcode,name,credit,physicalId,validation',
            accesses: 'id,walletId,cardId,groupId,start,end',
            pendingCardUpdates: 'id,incrId,cardId,amount',
            images: 'id,blob'
        });

        return Promise.resolve();
    }

    wipe() {
        return Promise.all([
            this.db.tickets.clear(),
            this.db.accesses.clear(),
            this.db.pendingCardUpdates.clear(),
            this.db.images.clear()
        ]);
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
                ticket =>
                    reg.test(ticket.name) ||
                    ticket.barcode === input ||
                    ticket.physicalId === input ||
                    ticket.walletId === input
            )
            .limit(5)
            .toArray();
    }

    findByBarcode(barcode) {
        return this.db.tickets
            .filter(
                ticket =>
                    ticket.barcode === barcode ||
                    ticket.physicalId === barcode ||
                    ticket.walletId === barcode
            )
            .limit(1)
            .toArray();
    }

    walletMemberships(walletId) {
        return this.db.accesses.filter(access => access.walletId === walletId).toArray();
    }

    cardAccesses(cardId) {
        return this.db.accesses.filter(access => access.cardId === cardId).toArray();
    }

    pendingCardUpdates(cardId) {
        return this.db.pendingCardUpdates.filter(pcu => pcu.cardId === cardId).toArray();
    }

    validateTicket(key) {
        return this.db.tickets.update(key, { validation: new Date().toISOString() });
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
