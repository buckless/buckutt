const crypto = require('crypto');
const redis = require('server/app/cache');
const log = require('server/app/log')(module);

module.exports = async (req, res, next) => {
    if (req.method !== 'POST') {
        return next();
    }

    const idempotencyKey = req.get('idempotency-key');
    if (!idempotencyKey) {
        return next();
    }

    const authorization = req.headers.authorization || req.query.authorization;
    const key = crypto
        .createHash('sha1')
        .update(idempotencyKey + req.url + authorization)
        .digest('hex');
    const cacheKey = `idempotency/${key}`;

    let storedResponse;
    try {
        storedResponse = JSON.parse(await redis.getClient().getAsync(cacheKey));
    } catch (err) {
        return next(err);
    }

    if (!storedResponse) {
        log.info(`request ${cacheKey} not in cache`);

        res.once('finish', async () => {
            let headers = {};
            Object.keys(res._headers)
                .filter(
                    key =>
                        ['device', 'point', 'pointName', 'event', 'eventName', 'wiket'].indexOf(
                            key
                        ) > -1
                )
                .forEach(key => {
                    headers[key] = res._headers[key];
                });

            const responseToStore = JSON.stringify({
                statusCode: res.statusCode,
                // res.body is set by exposeResBody middleware
                body: res.body,
                headers
            });

            try {
                await redis.getClient().setAsync(cacheKey, responseToStore);
            } catch (err) {
                return next(err);
            }

            log.info(`request ${cacheKey} stored in cache`);
        });

        return next();
    }

    log.info(`request ${cacheKey} served from cache`);

    return res
        .set(storedResponse.headers)
        .status(storedResponse.statusCode)
        .json(storedResponse.body)
        .end();
};
