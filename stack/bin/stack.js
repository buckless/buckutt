#!/usr/bin/env node

const yargs = require('yargs')

const dev = require('../commands/dev');

yargs
  .usage('Usage: $0 <cmd>')
  .command('dev', 'Starts buckless in development mode', dev)
  .strict()
  .help()
  .demandCommand()
  .argv
