const io     = require('socket.io-client/dist/socket.io.js');
const fs     = require('fs');
const config = require('../../../config');

const opts = {
    // pfx               : fs.readFileSync(JSON.parse(config.certificate.path)),
    pfx               : null,
    passphrase        : JSON.parse(config.certificate.password),
    rejectUnauthorized: false
};

module.exports = (clientOpts) => io(JSON.parse(config.api), Object.assign({}, opts, clientOpts));
