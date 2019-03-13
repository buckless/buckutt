const fs = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const isRoot = require('is-root');
const execa = require('execa');
const log = require('../utils/log');

module.exports = async () => {
    const configPath = path.join(
        __dirname,
        '../../services/images/config.json'
    );

    const configFile = JSON.parse(await fs.readFile(configPath));

    const hosts = [
        configFile.urls.domain,
        `admin.${configFile.urls.domain}`,
        `client.${configFile.urls.domain}`,
        `api.${configFile.urls.domain}`,
        `images.${configFile.urls.domain}`
    ].join(' -d ');

    log(`Creating reverse_proxy's entry point`);

    const reverseProxyEntryPoint = path.join(
        __dirname,
        '../../services/images/reverse_proxy/docker-entrypoint.sh'
    );

    const certbot = `certbot certonly --standalone -n --email ${configFile.letsencrypt.mail} --agree-tos -d ${hosts}`
    const file = [
        '#!/bin/sh',
        '',
        configFile.letsencrypt.active ? certbot : `# ${certbot}`,
        '',
        'echo "Running nginx"',
        'exec nginx -g "daemon off;"'
    ];

    await fs.writeFile(reverseProxyEntryPoint, file.join('\n'));

    log.end(' Done');

    log(`Mapping reverse_proxy's configuration`);
    const baseProxyConf = path.join(
        __dirname,
        '../../services/volumes/reverse_proxy/server.conf.example'
    );

    const serverConf = (await fs.readFile(baseProxyConf, 'utf8'))
        .replace(/\{\{ROOTURL\}\}/g, configFile.urls.domain);

    const prodProxyConf = path.join(
        __dirname,
        '../../services/volumes/reverse_proxy/server.prod.conf'
    );

    await fs.writeFile(prodProxyConf, serverConf);

    log.end(' Done');

    log('Building services...');

    const dockerComposeYml = path.join(__dirname, '../../services/docker-compose.yml');
    await execa('docker-compose', ['-f', dockerComposeYml, 'build']);

    log.end(' Done');
};
