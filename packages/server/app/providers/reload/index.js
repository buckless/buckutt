const { name } = require('server/app/config').provider;

module.exports = require(`./${name}`);
