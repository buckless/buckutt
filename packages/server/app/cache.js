const redis = require('redis');
const promisifyAll = require('util-promisifyall');
const config = require('server/app/config');
const log = require('server/app/log')(module);

let client = {};

const ready = (interval = 2, retries = 15) => {
    return new Promise((resolve, reject) => {
        log.info('Connection to cache...');
        client = promisifyAll(
            redis.createClient({
                host: config.redis.host,
                port: config.redis.port,
                retry_strategy(options) {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        // end reconnecting on a specific error and flush all commands with an individual error
                        log.error('The server refused the connection');
                    }

                    if (options.attempt > retries) {
                        // end reconnecting with built in error
                        return reject(new Error(`Cache unavailable. Retried ${retries} times.`));
                    }

                    log.error(`Couldn't connect to cache. Retrying in ${interval} seconds...`);
                    // reconnect after
                    return interval * 1000;
                }
            })
        );

        client.once('connect', async () => {
            log.info('Connected to cache.');
            resolve();
        });
    });
};

const getClient = () => client;

module.exports = {
    getClient,
    ready,
    ...redis
};
