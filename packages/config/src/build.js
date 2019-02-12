const fs = require('fs-extra');
const path = require('path');
const get = require('lodash.get');
const set = require('lodash.set');
const merge = require('lodash.merge');
const fullConfig = require('../config.json');

const mapConfiguration = mapper => {
    const output = {};

    for (let [key, value] of Object.entries(mapper)) {
        if (typeof value === 'object') {
            output[key] = mapConfiguration(value);
            continue;
        }

        set(output, key, get(fullConfig, value));
    }

    return output;
};

const mapServerConfig = () => {
    const base = require('./server.base.json');
    const extend = require('./server.extend.json');

    return merge(base, mapConfiguration(extend), {
        log: {
            console: {
                level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
            }
        },
        client: mapConfiguration(require('./client.json'))
    });
};

const main = async () => {
    const adminConfig = mapConfiguration(require('./admin.json'));
    const managerConfig = mapConfiguration(require('./manager.json'));
    const clientConfig = mapConfiguration(require('./client.json'));
    const serverConfig = mapServerConfig();

    await fs.writeFile(path.join(__dirname, '../admin.json'), JSON.stringify(adminConfig, null, 2));

    await fs.writeFile(
        path.join(__dirname, '../manager.json'),
        JSON.stringify(managerConfig, null, 2)
    );

    await fs.writeFile(
        path.join(__dirname, '../client.json'),
        JSON.stringify(clientConfig, null, 2)
    );

    await fs.writeFile(
        path.join(__dirname, '../server.json'),
        JSON.stringify(serverConfig, null, 2)
    );
};

module.exports = main;

if (require.main === module) {
    main();
}
