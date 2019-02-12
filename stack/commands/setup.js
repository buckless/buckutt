const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const isRoot = require('is-root');
const hostile = require('hostile');
const { ip } = require('address');
const execa = require('execa');
const log = require('../utils/log');

const set = promisify(hostile.set);

module.exports = async () => {
    if (!isRoot()) {
        log('You need to be root to run yarn stack setup');
        process.exit(1);
    }

    const hosts = [
        'dev.inst.buckless.com',
        'admin.dev.inst.buckless.com',
        'client.dev.inst.buckless.com',
        'api.dev.inst.buckless.com',
        'images.dev.inst.buckless.com'
    ].join(' ');

    await set('127.0.0.1', hosts);
    log('Added *.inst.buckless.com to /etc/hosts');

    const reverseProxyEntryPointExample = path.join(__dirname, '../../services/images/reverse_proxy/docker-entrypoint.sh.example');
    const lines = (await fs.readFile(reverseProxyEntryPointExample)).toString()
        .split('\n')
        .map(line => {
            return (line.match(/host\.docker\.internal" >> \/etc\/hosts$/))
                ? `echo "${ip()} host.docker.internal" >> /etc/hosts`
                : line;
        })
        .join('\n');

    const reverseProxyEntryPoint = path.join(__dirname, '../../services/images/reverse_proxy/docker-entrypoint.sh');

    await fs.writeFile(reverseProxyEntryPoint, lines);
    log(`Added local ip (${ip()}) to reverse_proxy's /etc/hosts`);

    const dockerComposeDevYml = path.join(__dirname, '../../services/docker-compose.dev.yml');
    await execa('docker-compose', ['-f', dockerComposeDevYml, 'build']);
    log('Built services docker-compose');

    execa('docker-compose', ['-f', dockerComposeDevYml, 'up', '-d'], { detached: true });
    log('Starting services docker-compose...');
};
