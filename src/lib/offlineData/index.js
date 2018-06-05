let Dexie = require('dexie');

Dexie = Dexie.default ? Dexie.default : Dexie;

class OfflineData {
    constructor() {
        this.db = new Dexie('buckless.db');
    }

    init() {
        this.db.version(1).stores({
            users: 'uid,name,username,barcode,credit',
            accesses: 'id,cardId,group,start,end',
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
        // dexie wants object and not array, restore from table schema (todo: send objects at first)
        if (table === 'users') {
            data = data.map(entry => ({
                uid: entry[0],
                name: entry[1],
                username: entry[2],
                barcode: entry[3],
                credit: entry[4]
            }));
        } else if (table === 'accesses') {
            data = data.map(entry => ({
                id: entry[0],
                cardId: entry[1],
                group: entry[2],
                start: entry[3],
                end: entry[4]
            }));
        }

        return this.db[table].bulkAdd(data);
    }

    update(table, primaryKey, data) {
        return this.db[table].update(primaryKey, data);
    }

    delete(table, primaryKey) {
        return this.db[table].delete(primaryKey);
    }
}

module.exports = OfflineData;
