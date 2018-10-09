const Queue = require('bull');
const redis = require('@/cache');
const config = require('@/config');
const log = require('@/log')(module);

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

            await setAsync(`${prefix}-tickets`, JSON.stringify(tasks));
            await setAsync(`${prefix}-lastUpdate`, Date.now().toString());
            log.info(`saved ${tasks.length} tickets into redis`);

            job.progress(100);

            done();
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

        return tickets.find(ticket => ticket.mail === input || ticket.ticketId === input);
    }
};

module.exports = ticketProvider;
