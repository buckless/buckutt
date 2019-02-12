const chalk = require('chalk').default;

module.exports = str => process.stdout.write(`[${chalk.green('stack')}] ${str}`);

module.exports.end = str => process.stdout.write(`${str}\n`);
