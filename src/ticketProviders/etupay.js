const axios = require('axios');
const username = require('../lib/username');
const { memoize } = require('lodash');

const config = require('../../config').assigner.etupay;

const url = `${config.url}/${config.key}/billets`;

const fetcher = memoize(() => axios.get(url));

setInterval(() => fetcher.cache.clear(), 30 * 1000);

module.exports = ticketNumber => {
    if (!config.url || !config.key) {
        throw new Error('Missing config.etupay.billetweb.{url,key}');
    }

    let ticket;
    let credit;

    return fetcher()
        .then(res => {
            if (!Array.isArray(res.data) || !res.data.length) {
                return Promise.resolve();
            }

            ticket = res.data.find(t => t.qrcode === ticketNumber);

            if (!ticket) {
                return Promise.resolve(null);
            }

            credit = ticket.options
                .filter(option => option.name.toLowerCase().indexOf('cashless') > -1)
                .map(option => option.price)
                .reduce((a, b) => a + b, 0);

            return username(ticket.surname, ticket.name);
        })
        .then(username => {
            if (!username) {
                return null;
            }

            return {
                firstname: ticket.surname,
                lastname: ticket.name,
                mail: ticket.mail,
                username,
                credit,
                ticketId: ticket.qrcode,
                physicalId: ticket.uuid
            };
        });
};
