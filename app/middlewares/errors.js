const { bookshelf } = require('@/db');
const logger = require('@/log');
const APIError = require('@/utils/APIError');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, _) => {
    req.details = req.details || {};

    const errModule = err.module
        ? err.module
        : // take first line path. using throw, it will be the module that threw the error
          err.stack.split('\n')[1].match(/at (.+):\d+:\d+/)[1];

    // common non-api errors
    if (err.constraint && err.constraint.endsWith('_unique')) {
        err = new APIError(errModule, 400, 'Duplicate Entry', err.message);
    }

    if (err instanceof bookshelf.Model.NotFoundError) {
        err = new APIError(errModule, 404, 'Not Found', err.message);
    }

    if (err instanceof bookshelf.Model.NoRowsUpdatedError) {
        err = new APIError(errModule, 400, 'Invalid model', err.message);
    }

    /* istanbul ignore next */
    if (!(err instanceof APIError)) {
        logger('app').error(`${err.message}\n${JSON.stringify(req.details)}`);

        err = new APIError(module, 500, 'Unknown error');
    } else {
        req.details.error = err.details;

        logger(errModule).error(`${err.message}\n${JSON.stringify(req.details)}`);
    }

    // do not write headers after they are sent (by permanent sse http connection)
    if (req.details.sse) {
        return;
    }

    res.status(err.status || 500)
        .send(err.toJSON())
        .end();
};
