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

    const cacheKey       = idempotencyKey;
    const storedResponse = JSON.parse(await redis.getClient().getAsync(cacheKey));

    if (!storedResponse) {
        log.debug(`Request ${idempotencyKey} not in cache`);

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

            await redis.getClient().setAsync(cacheKey, responseToStore);
            console.log('stored response against idempotency key in redis: ', idempotencyKey);
        });

        return next();
    }

    log.debug(`Request ${idempotencyKey} served from cache`);

    res
        .set(storedResponse.headers)
        .status(storedResponse.statusCode)
        .json(storedResponse.body)
        .end();
}
