import 'source-map-support/register';
import fs           from 'fs';
import path         from 'path';
import bodyParser   from 'body-parser';
import compression  from 'compression';
import consoleTitle from 'console-title';
import cookieParser from 'cookie-parser';
import express      from 'express';
import https        from 'https';
import morgan       from 'morgan';
import APIError     from './APIError';
import config       from './config';
import logger       from './log';
import { pp }       from './lib/utils';
import controllers  from './controllers';
import models       from './models';
import { startSSE } from './changes';

const log = logger(module);

const app = express();

app.locals.config = config;
app.locals.models = models;

/**
 * Middlewares
 */

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());

app.use(controllers);

// 404 Handling
app.use((req, res, next) => {
    next(new APIError(404, 'Not Found'));
});

// Other errors (req is not used, but four arguments must be detected by express to recognize error middleware)
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.log(err.stack);
    const newErr = err;

    log.error(newErr.message);

    if (err instanceof APIError) { log.error(newErr.details); }

    /* istanbul ignore if */
    if (newErr.message === 'Unknown error') {
        console.log(pp(newErr));
    }

    res
        .status(newErr.status || 500)
        .json(newErr)
        .end();
});

app.start = () => {
    let key;
    let cert;
    let ca;

    /* istanbul ignore else */
    if (process.env.NODE_ENV === 'test') {
        key  = `./ssl/test/server.key`;
        cert = `./ssl/test/server.crt`;
        ca   = `./ssl/test/ca.crt`;
    } else {
        key  = `./ssl/server-key.pem`;
        cert = `./ssl/server-crt.pem`;
        ca   = `./ssl/ca-crt.pem`;
    }

    const server = https.createServer({
        key               : fs.readFileSync(key),
        cert              : fs.readFileSync(cert),
        ca                : fs.readFileSync(ca),
        requestCert       : true,
        rejectUnauthorized: false
    }, app);

    server.listen(config.port, () => {
        log.info('Server is listening on port %d', config.port);
        log.warn('Loading models...');
    });

    startSSE(server, app);
};

// Start the application
/* istanbul ignore if */
if (require.main === module) {
    app.start();
}

export default app;
