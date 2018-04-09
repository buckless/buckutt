let Dexie = require('dexie');

Dexie = Dexie.default ? Dexie.default : Dexie;

class OfflineData {
    constructor() {
        this.db = new Dexie('buckless.db');
    }

    init() {
        this.db.version(1).stores({
            users: 'uid,name,barcode,credit',
            accesses: 'id,cardId,group,start,end'
        });

        return Promise.resolve();
    }

    close() {
        this.db.close();
        return Promise.resolve();
    }

    empty(table) {
        return this.db[table].clear();
    }

    findByName(name) {
        const reg = new RegExp(`(.*)${name}(.*)`, 'i');

        return this.db.users
            .filter(user => reg.test(user.name))
            .limit(5)
            .toArray();
    }

    findByBarcode(barcode) {
        const reg = new RegExp(`${barcode}(.*)`, 'i');

        return this.db.users
            .filter(user => reg.test(user.barcode))
            .limit(5)
            .toArray();
    }

    cardAccesses(cardId) {
        return this.db.accesses.filter(access => access.cardId === cardId).toArray();
    }

    insert(table, data) {
        // dexie wants object and not array, restore from table schema
        if (table === 'users') {
            data = data.map(entry => ({
                uid: entry[0],
                name: entry[1],
                barcode: entry[2],
                credit: entry[3]
            }));
        } else if (table === 'accesses') {
            data = data.map(entry => ({
                id: entry[0],
                cardId: entry[1],
                groupId: entry[2],
                start: entry[3],
                end: entry[4]
            }));
        }

        return this.db[table].bulkAdd(data);
    }
}

module.exports = OfflineData;
