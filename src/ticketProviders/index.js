const name = require('../../config').assigner.ticketProvider;

let provider;

try {
    provider = require(`./${name}`);
} catch (err) {
    throw err;
}

module.exports = provider;
