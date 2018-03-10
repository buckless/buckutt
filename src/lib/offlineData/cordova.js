class OfflineData {
    init() {
        return new Promise((resolve, reject) => {
            this.db = window.sqlitePlugin.openDatabase({
                name    : 'buckless.db',
                location: 'default'
            });

            this.db.transaction((tx) => {
                tx.executeSql('create table if not exists users (uid, name, barcode, credit)');
                tx.executeSql('create table if not exists accesses (cardId, group, start, end)');
            }, reject, resolve);
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close(resolve, reject);
        });
    }

    empty(table) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(`delete from ${table}`);
            }, reject, () => {
                this.db.executeSql('vacuum', reject, resolve);
            });
        });
    }

    findByName(name) {
        return new Promise((resolve, reject) => {
            const query = 'select * from users where name like ? limit 5';

            this.db.transaction((tx) => {
                tx.executeSql(query, [ `%${name}%` ], (tx, rs) => {
                    const res = [];

                    for (let i = rs.rows.length - 1; i >= 0; i--) {
                        // we're using uid as row so that we don't interfere with primary key
                        let row = rs.rows.item(i);

                        row.id = row.uid;
                        delete row.uid;

                        res.push(rs.rows.item(i));
                    }

                    resolve(res);
                }, reject);
            }, reject);
        });
    }

    findByBarcode(barcode) {
        return new Promise((resolve, reject) => {
            const query = 'select * from users where barcode like ? limit 5';

            this.db.transaction((tx) => {
                tx.executeSql(query, [ `${barcode}%` ], (tx, rs) => {
                    const res = [];

                    for (let i = rs.rows.length - 1; i >= 0; i--) {
                        // we're using uid as row so that we don't interfere with primary key
                        let row = rs.rows.item(i);

                        row.id = row.uid;
                        delete row.uid;

                        res.push(rs.rows.item(i));
                    }

                    resolve(res);
                }, reject);
            }, reject);
        });
    }

    cardAccesses(cardId) {
        return new Promise((resolve, reject) => {
            const query = 'select * from accesses where cardId = ?';

            this.db.transaction((tx) => {
                tx.executeSql(query, [ cardId ], (tx, rs) => {
                    const res = [];

                    for (let i = rs.rows.length - 1; i >= 0; i--) {
                        // we're using uid as row so that we don't interfere with primary key
                        let row = rs.rows.item(i);

                        res.push(rs.rows.item(i));
                    }

                    resolve(res);
                }, reject);
            }, reject);
        });
    }

    insert(table, data) {
        if (!data.length) {
            return Promise.resolve();
        }

        const valuesMask = Object.keys(data[0]).map(_ => '?').join(',');

        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                for (let i = users.length - 1; i >= 0; i--) {
                    tx.executeSql(`insert into ${table} values (${valuesMask})`, users[i]);
                }
            }, reject, resolve);
        });
    }
}

module.exports = OfflineData;
