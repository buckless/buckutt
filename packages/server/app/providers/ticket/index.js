const Queue = require('bull');
const redis = require('server/app/cache');
const config = require('server/app/config');
const log = require('server/app/log')(module);

const providers = config.assigner.ticketProviders.map(name => require(`./${name}`));

let redisClient = null;
let queue = null;

let setAsync;
let getAsync;

const prefix = 'buckless-server-ticketProviders';

const ticketProvider = {
    setup: () => {
        redisClient = redis.getClient().duplicate();

        setAsync = require('util')
            .promisify(redisClient.set)
            .bind(redisClient);
        getAsync = require('util')
            .promisify(redisClient.get)
            .bind(redisClient);

        queue = new Queue('ticket-providers', {
            redis: {
                host: config.redis.host,
                port: config.redis.port
            }
        });

        queue.process(async (job, done) => {
            const lock = await getAsync(`${prefix}-tickets-lock`);

            if (lock) {
                return done();
            }

            await setAsync(`${prefix}-tickets-lock`, true);

            try {
                let progress = 0;
                let allTickets = [];

                const tasks = providers.map(provider =>
                    provider().then(tickets => {
                        // when each provider has resolved, progress should be around 80%
                        progress += 80 / providers.length;
                        job.progress(progress);

                        allTickets = allTickets.concat(tickets);
                    })
                );

                await Promise.all(tasks);

                await setAsync(`${prefix}-tickets`, JSON.stringify(allTickets));
                await setAsync(`${prefix}-lastUpdate`, Date.now().toString());
                log.info(`saved ${allTickets.length} tickets into redis`);

                job.progress(100);
            } catch (err) {
                log.error(`Failed to fetch tickets: ${err.message}`);
            } finally {
                await setAsync(`${prefix}-tickets-lock`, false);
                done();
            }
        });

        // fetch right now and start a cron task
        queue.add(null);
        queue.add(null, { repeat: { cron: '0 */2 * * *' } });

        setTimeout(() => {
            ticketProvider.fetchTicket('foo@bar.com');
        }, 1000);
    },

    async fetchTicket(input) {
        let lastUpdate = (await getAsync(`${prefix}-lastUpdate`)) || '0';
        lastUpdate = parseInt(lastUpdate, 10);

        if (lastUpdate < Date.now() - 5 * 1000 * 1000) {
            log.info('last update is more than 5 minutes ago, refreshing');
            queue.add(null);
        }

        let tickets = await getAsync(`${prefix}-tickets`);
        tickets = JSON.parse(tickets);

        return tickets.find(
            ticket =>
                ticket.mail === input || ticket.ticketId === input || ticket.physicalId === input
        );
    }
};

module.exports = ticketProvider;
