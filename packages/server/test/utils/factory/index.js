module.exports = {
    async factory(t, ...queries) {
        const db = await module.exports.db(t.context);

        t.context = {
            ...t.context,
            factory: {
                ...module.exports,
                db,
                clears: []
            },
            ctx: {
                models: db.models,
                event: t.context.event,
                pub: {
                    publish: () => Promise.resolve()
                },
                wiket: t.context.webWiket
            }
        };

        const documents = await Promise.all(queries.map(query => query(t.context)));

        for (let document of documents) {
            t.context[document.name] = document.data;
        }
    },

    async clear(t) {
        for (let clear of t.context.factory.clears) {
            await clear(t.context);
        }
    },

    document(fields) {
        const now = new Date();

        return Object.assign(
            {
                created_at: now,
                updated_at: now,
                deleted_at: null,
                active: true
            },
            fields
        );
    },

    db: require('./db'),
    user: require('./user'),
    wallet: require('./wallet'),
    ticket: require('./ticket'),
    device: require('./device')
};
