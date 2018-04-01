const fs       = require('fs');
const axios    = require('axios');
const parse    = require('csv').parse;
const { pick } = require('lodash');

module.exports = (ticketOrMail) => {
    const config = require('../../config').assigner.csv;

    if (!config.url && !config.file) {
        throw new Error('Missing config.assigner.csv.url or config.assigner.csv.file');
    }

    let initialPromise;
    const parser = parse({ columns: true });
    let result = null;

    if (config.url) {
        axios[config.url.method](config.url.url, { headers: config.url.headers }).then((res) => {
            parser.write(res.data);
            parser.end();
        });
    } else {
        fs.createReadStream(config.file).pipe(parser);
    }

    parser.on('readable', () => {
        while (record = parser.read()) {
            if (record.ticket === ticketOrMail || record.mail === ticketOrMail) {
                result = record;
            }
        }
    });

    return new Promise((resolve) => {
        parser.on('finish', () => {
            if (!result) {
                return resolve(null);
            }

            result.ticketId = result.ticket;
            result.credit = parseInt(result.preload, 10);

            resolve(pick(result, ['firstname', 'lastname', 'nickname', 'mail', 'credit', 'ticketId']));
        });
    });
};
