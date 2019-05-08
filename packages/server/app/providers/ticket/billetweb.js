const axios = require('axios');

const config = require('server/app/config').assigner.billetweb;

const url = `https://www.billetweb.fr/api/event/${config.event}/attendees`;
const params = {
    user: config.user,
    key: config.key,
    version: config.version
};

const getCredit = ({ data }, { id }) => {
    const preloads = config.ticketIdPreload;

    let result = data.find(t => preloads.indexOf(t.ticket_id.toString()) > -1 && t.pass === id);

    result = result || { price: 0 };

    return Math.floor(parseFloat(result.price) * 100);
};

module.exports = async function billetweb() {
    if (!config.event || !config.user || !config.key || !config.version) {
        return [];
    }

    const ticketIds = config.ticketIdTicket;
    const res = await axios.get(url, { params });

    if (!Array.isArray(res.data) || !res.data.length) {
        return [];
    }

    // TODO: replace with event emitter + OBOE.js
    // (we need credit in the ticket and not in another ticket to do so :/)
    return res.data
        .filter(ticket => ticketIds.indexOf(ticket.ticket_id.toString()) > -1)
        .map(ticket => ({
            firstname: ticket.firstname,
            lastname: ticket.name,
            mail: ticket.email || ticket.order_email,
            amount: getCredit(res, ticket),
            logical_id: ticket.barcode,
            physical_id: ticket.ext_id,
            clientTime: ticket.order_date
        }));
};
