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

    axios.get(url, { params })
        .then(res => {
            ticket = res.data.find(t => t.barcode === ticketNumber);

            if (!ticket) {
                return Promise.resolve(null);
            }

            return username()
        })
        .then((username) => {
            return {
                firstname: ticket.firstname,
                lastname: ticket.lastname,
                username,
                credit: 0,
                ticketId: ticket.barcode
            };
        });
};
