const redis = require('redis');
const promisifyAll = require('util-promisifyall');
const config = require('../../config');
const logger = require('./log');
const log = logger(module);

let client = {};

const waitForCache = (interval, retries) => {
    return new Promise((resolve, reject) => {
        log.info('Connection to cache...');
        client = promisifyAll(
            redis.createClient({
                host: config.redis.host,
                port: config.redis.port,
                retry_strategy: function(options) {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        // End reconnecting on a specific error and flush all commands with
                        // a individual error
                        log.error('The server refused the connection');
                    }

                    if (options.attempt > retries) {
                        // End reconnecting with built in error
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
    waitForCache,
    ...redis
};
