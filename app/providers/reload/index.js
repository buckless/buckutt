const { name } = require('@/config').provider;

module.exports = require(`./${name}`);
