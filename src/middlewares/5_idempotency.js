const APIError = require('../errors/APIError');
const config   = require('../../config');
const redis    = require('../lib/redis');
const logger   = require('../lib/log');

const log = logger(module);

module.exports = async (req, res, next) => {
    const idempotencyKey = req.get('idempotency-key');
    if (!idempotencyKey) {
        return next();
    }

    const cacheKey = 'idempotency_' + idempotencyKey;

    let storedResponse;
    try {
        storedResponse = JSON.parse(await redis.getClient().getAsync(cacheKey));
    } catch (e) {
        return Promise.reject(e);
    }

    if (!storedResponse) {
        log.info(`request ${idempotencyKey} not in cache`);

        res.once('finish', async () => {
            let headers = {};
            Object
                .keys(res._headers)
                .filter(key => ['device', 'point', 'pointName', 'event', 'eventName', 'wiket'].indexOf(key) > -1)
                .forEach(key => { headers[key] = res._headers[key] });

            const responseToStore = JSON.stringify({
                statusCode: res.statusCode,
                body      : JSON.parse(res.body),
                headers
            });

            try {
                await redis.getClient().setAsync(cacheKey, responseToStore);
            } catch (e) {
                return Promise.reject(e);
            }

            log.info(`request ${idempotencyKey} stored in cache`);
        });

        return next();
    }

    log.info(`request ${idempotencyKey} served from cache`);

    res
        .set(storedResponse.headers)
        .status(storedResponse.statusCode)
        .json(storedResponse.body)
        .end();
}
