const axios = require('axios');

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

    axios.get(url, { params }).then(res => {
        const ticket = res.data.find(t => t.barcode === ticketNumber);

        if (!ticket) {
            return Promise.resolve(null);
        }

        return {
            firstname: ticket.firstname,
            lastname: ticket.lastname,
            credit: 0,
            ticketId: ticket.barcode
        };
    });
};
