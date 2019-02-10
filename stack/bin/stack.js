#!/usr/bin/env node

const yargs = require('yargs');

const dev = require('../commands/dev');
const setup = require('../commands/setup');
const down = require('../commands/down');

yargs
    .usage('Usage: $0 <cmd>')
    .command('dev', 'Starts buckless in development mode', () => { dev(); })
    .command('setup', 'Setups buckless stack (requires super-user)', () => { setup(); })
    .command('down', 'Clears buckless stack (requires super-user)', () => { down(); })
    .strict()
    .help()
    .demandCommand().argv;
