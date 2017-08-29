const nconf = require('nconf');
const path  = require('path');

/**
 * Environment (eg: test, prod) is loaded in order of priority from:
 * Argv > Environment viarable > process.env.json
 */
nconf
    .argv()
    .env()
    .file({ file: path.join(__dirname, 'process.env.json') });

// Load environment config file
const envName = nconf.get('NODE_ENV') || 'production';
const config  = require(path.join(__dirname, 'profiles', envName));
config.env    = envName;

if (config.log.console === 'debug') {
    console.log(`Config loaded: ${config.env}`);
}

module.exports = config;
