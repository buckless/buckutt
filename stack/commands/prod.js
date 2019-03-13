const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');
const log = require('../utils/log');

module.exports = async () => {
    const dockerComposeYml = path.join(__dirname, '../../services/docker-compose.yml');

    log('Starting docker-compose services...');

    execa('docker-compose', ['-f', dockerComposeYml, 'up', '-d'], { detached: true });

    log.end(' Done');
};
