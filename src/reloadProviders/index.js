const name = require('../../config').provider.name;

let provider;

try {
    provider = require(`./${name}`);
} catch (err) {
    provider = require('./test');
}

module.exports = provider;
