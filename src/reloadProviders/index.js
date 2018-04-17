const name = require('../../config').provider.name;

let provider;

try {
    provider = require(`./${name}`);
} catch (err) {
    throw err;
}

module.exports = provider;
