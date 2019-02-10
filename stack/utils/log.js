const chalk = require('chalk').default;

module.exports = (str, ...args) => console.log(`[${chalk.green('stack')}] ${str}`, ...args);
