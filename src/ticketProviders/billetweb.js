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

    let ticket;
    let credit;
    let ticketData;

    return axios
        .get(url, { params })
        .then(res => {
            if (!Array.isArray(res.data) || !res.data.length) {
                return Promise.resolve();
            }

            ticket = res.data.find(
                t =>
                    config.ticketIdTicket.indexOf(t.ticket_id.toString()) > -1 &&
                    (t.ext_id === ticketNumber || t.barcode === ticketNumber)
            );

            credit = res.data.find(
                t =>
                    config.ticketIdPreload.indexOf(t.ticket_id.toString()) > -1 &&
                    t.pass === ticket.id
            ) || {
                price: 0
            };

            credit = Math.floor(parseFloat(credit.price) * 100);

            if (!credit) {
                credit = 0;
            }

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
                credit,
                ticketId: ticket.barcode
            };
        });
};
