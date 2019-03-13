#!/usr/bin/env node

const yargs = require('yargs');

const prod = require('../commands/prod');
const dev = require('../commands/dev');
const setupDev = require('../commands/setup.dev');
const setupProd = require('../commands/setup.prod');
const down = require('../commands/down');

yargs
    .usage('Usage: $0 <cmd>')
    .command('dev', 'Starts buckless in development mode', () => { dev(); })
    .command('prod', 'Starts buckless in production mode', () => { prod(); })
    .command('setup:dev', 'Setups buckless dev stack (requires super-user)', () => { setupDev(); })
    .command('setup:prod', 'Setups buckless prod stack', () => { setupProd(); })
    .command('down', 'Clears buckless dev stack (requires super-user)', () => { down(); })
    .strict()
    .help()
    .demandCommand().argv;
