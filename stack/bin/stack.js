#!/usr/bin/env node

const yargs = require('yargs');

const dev = require('../commands/dev');
const setup = require('../commands/setup');

yargs
    .usage('Usage: $0 <cmd>')
    .command('dev', 'Starts buckless in development mode', dev)
    .command('setup', 'Setups buckless stack (requires super-user)', setup)
    .strict()
    .help()
    .demandCommand().argv;
