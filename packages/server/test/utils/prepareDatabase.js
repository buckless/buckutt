const db = require('server/app/db');
const { erase } = require('server/app/actions/database');

const prepareDatabase = async () => {
    await db.ready();

    await erase({
        models: db.models,
        pub: {
            publish: () => Promise.resolve()
        }
    });

    await db.bookshelf.knex.seed.run();

    // Tests seeds
    for (let i = 0; i < 50; i++) {
        await new db.models.PhysicalSupport({ logical_id: `L${i}`, physical_id: `P${i}` }).save();
    }
};

/* istanbul ignore if */
if (require.main === module) {
    prepareDatabase()
        .then(() => process.exit(0))
        .catch(err => {
            // eslint-disable-next-line no-console
            console.error(err);
            process.exit(-1);
        });
}