const fs = require('fs');
const axios = require('axios');
const parser = require('csv');
const { pick } = require('lodash');
const config = require('server/app/config').assigner.csv;

const readFile = require('util').promisify(fs.readFile);
const parse = require('util').promisify(parser.parse);

module.exports = async function csv() {
    if (!config.url && !config.file) {
        return [];
    }

    const input = config.url
        ? (await axios[config.url.method](config.url.url, { headers: config.url.headers })).data
        : await readFile(config.file);

    const results = await parse(input, { columns: true });

    return results.map(result => {
        result.logical_id = result.ticket;
        result.physical_id = result.physical;
        result.amount = parseInt(result.preload, 10);

        return pick(result, [
            'firstname',
            'lastname',
            'nickname',
            'mail',
            'amount',
            'logical_id',
            'physical_id'
        ]);
    });
};
