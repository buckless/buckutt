const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const isRoot = require('is-root');
const hostile = require('hostile');
const log = require('../utils/log');

const remove = promisify(hostile.remove);

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

    await remove('127.0.0.1', hosts);
    log('Removed *.inst.buckless.com from /etc/hosts');

    const reverseProxyEntryPoint = path.join(__dirname, '../../services/images/reverse_proxy/docker-entrypoint.sh');
    const lines = (await fs.readFile(reverseProxyEntryPoint)).toString()
        .split('\n')
        .map(line => {
            return (line.match(/host\.docker\.internal" >> \/etc\/hosts$/))
                ? `echo "127.0.0.1 host.docker.internal" >> /etc/hosts`
                : line;
        })
        .join('\n');

    await fs.writeFile(reverseProxyEntryPoint, lines);
    log(`Restored default ip (127.0.0.1) to reverse_proxy's /etc/hosts`);
};
