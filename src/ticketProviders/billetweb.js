const axios = require('axios');
const username = require('../lib/username');

module.exports = ticketNumber => {
    const config = require('../../config').assigner.billetweb;

    if (!config.event || !config.user || !config.key || !config.version) {
        throw new Error('Missing config.assigner.billetweb.{event,user,key,version}');
    }

    const url = `https://www.billetweb.fr/api/event/${config.event}/attendees`;
    const params = {
        user: config.user,
        key: config.key,
        version: config.version
    };

    let ticketData;

    return axios
        .get(url, { params })
        .then(res => {
            ticket = res.data.find(t => t.barcode === ticketNumber);

            if (!ticket) {
                return Promise.resolve(null);
            }

            return username(ticket.firstname, ticket.name);
        })
        .then(username => {
            if (!username) {
                return null;
            }

            return {
                firstname: ticket.firstname,
                lastname: ticket.name,
                mail: ticket.email,
                username,
                credit: 0,
                ticketId: ticket.barcode
            };
        });
};
