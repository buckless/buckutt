import app     from '../src/app';
import fs      from 'fs';
import unirest from 'unirest';

describe('Should start the test application', () => {
    it('should init models', function (done) {
        this.timeout(500 * 1000);

        app.start();

        app.locals.models.onReady = () => {
            done();
        };
    });
});

const certFile = fs.readFileSync('ssl/test/test.crt');
const keyFile  = fs.readFileSync('ssl/test/test.key');
const caFile   = fs.readFileSync('ssl/test/ca.crt');

const options = {
    cert              : certFile,
    key               : keyFile,
    ca                : caFile,
    strictSSL         : false,
    rejectUnauthorized: false
};

unirest.request = unirest.request.defaults(options);

global.unirest = unirest;
global.q       = obj => encodeURIComponent(JSON.stringify(obj));

['get', 'post', 'put', 'delete'].forEach(method => {
    const previous_ = unirest[method];
    unirest[method] = (...args) => previous_(...args).header('Authorization', `Bearer ${process.env.TOKEN}`);
});
