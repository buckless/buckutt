const path         = require('path');
const fs           = require('fs-extra');
const inquirer     = require('inquirer');
const childProcess = require('child_process');
const Promise      = require('bluebird');
const logger       = require('../src/lib/log');
const randomstring = require('randomstring');

const log = logger(module);

let prompter;

if (process.env.RANDOM_SSL_PASSWORD) {
    const chalPassword = randomstring.generate();
    const outPassword  = randomstring.generate();

    prompter = Promise.resolve({
        chalPassword,
        outPassword
    });

    console.log('----');
    console.log('[ challenge password ]', chalPassword);
    console.log('[ output password ]', outPassword);
    console.log('----');
} else {
    prompter = inquirer.prompt([
        {
            type   : 'password',
            name   : 'chalPassword',
            message: 'Define challenge password :'
        },
        {
            type   : 'password',
            name   : 'outPassword',
            message: 'Define output password :'
        }
    ]);
}

Promise.promisifyAll(childProcess);
const exec = childProcess.execAsync;

// status
log.info('Copying files...');

try {
    fs.copySync('./ssl/example/ca.cnf', './ssl/ca.cnf');
    fs.copySync('./ssl/example/server.cnf', './ssl/server.cnf');
} catch (e) {
    throw new Error(e);
}

prompter.then((answer) => {
    log.info('Updating files...');

    try {
        const server = fs.readFileSync('./ssl/server.cnf', 'utf8')
            .replace(/(challengePassword\s*= )(\w*)/, `$1${answer.chalPassword}`);
        const ca     = fs.readFileSync('./ssl/ca.cnf', 'utf8')
            .replace(/(challengePassword\s*= )(\w*)/, `$1${answer.chalPassword}`)
            .replace(/(output_password\s*= )(\w*)/, `$1${answer.outPassword}`);

        fs.writeFileSync('./ssl/server.cnf', server, 'utf8');
        fs.writeFileSync('./ssl/ca.cnf', ca, 'utf8');
    } catch (e) {
        return Promise.reject(new Error(e));
    }

    log.info('Generating certificates...');

    const cwd = path.join(__dirname, '..', 'ssl');

    /* eslint-disable max-len */
    return exec('openssl req -new -x509 -days 9999 -config ca.cnf -keyout ca-key.pem -out ca-crt.pem', { cwd })
        .then(() => exec('openssl genrsa -out server-key.pem 4096', { cwd }))
        .then(() => exec('openssl req -new -config server.cnf -key server-key.pem -out server-csr.pem', { cwd }))
        .then(() => exec(`openssl x509 -req -extfile server.cnf -days 999 -passin "pass:${answer.outPassword}" -in server-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out server-crt.pem`, { cwd }));
    /* eslint-enable max-len */
})
.then(() => {
    process.exit(0);
})
.catch((err) => {
    console.log(err);
    process.exit(1);
});
