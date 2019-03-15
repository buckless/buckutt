const ms = require('ms');
const uuid = require('uuid');
const { pullAll, chunk } = require('lodash');
const util = require('util');
const redis = require('server/app/cache');
const config = require('server/app/config');
const log = require('server/app/log')(module);
const { knex } = require('server/app/db');

const providers = config.assigner.ticketProviders.map(name => require(`./${name}`));

const lock = 'buckless-server-ticketProviders-lock';

const processChunk = chunk =>
    chunk.map(row => {
        const insert = knex('tickets').insert({
            id: uuid(),
            active: true,
            ...row
        });
        const update = knex.queryBuilder().update(row);

        return knex
            .raw(`? ON CONFLICT ON CONSTRAINT unique_logical DO ? RETURNING logical_id`, [
                insert,
                update
            ])
            .then(result => result.rows[0].logical_id);
    });

const ticketProvider = async app => {
    const redisClient = redis.getClient().duplicate();

    const setAsync = util.promisify(redisClient.set).bind(redisClient);
    const getAsync = util.promisify(redisClient.get).bind(redisClient);

    const lastCall = await getAsync(lock);
    const now = new Date().getTime();

    if (now - lastCall < ms('5m')) {
        setTimeout(() => {
            ticketProvider(app);
        }, ms('2m'));
        return;
    }

    await setAsync(lock, new Date().getTime());

    const logicalIdsToDelete = (await app.locals.models.Ticket.query().select('logical_id')).map(
        ticket => ticket.logical_id
    );

    await Promise.all(
        providers.map(async fetchTicketsFromProvider => {
            // TODO: we should replace with a Event<->Promise that on('chunk', process + pullAll)
            // const providerTickets = chunk(await fetchTicketsFromProvider());
            const providerTickets = await fetchTicketsFromProvider();
            const savedLogicalIds = await Promise.all(processChunk(providerTickets));

            // remove all saved logical ids from the ones to delete
            pullAll(logicalIdsToDelete, savedLogicalIds);

            log.info(
                [
                    'saved',
                    providerTickets.length,
                    'tickets from provider',
                    fetchTicketsFromProvider.name
                ].join(' ')
            );
        })
    );

    // left are logical ids that are not in providers anymore
    await app.locals.models.Ticket.where('logical_id', 'in', logicalIdsToDelete).destroy();

    setTimeout(() => {
        ticketProvider(app);
    }, ms('5m'));
};

module.exports = ticketProvider;
