const axios = require('axios');
const username = require('server/app/helpers/username');

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

module.exports = async () => {
    if (!config.event || !config.user || !config.key || !config.version) {
        return [];
    }

    const res = await axios.get(url, { params });

    if (!Array.isArray(res.data) || !res.data.length) {
        return [];
    }

    return Promise.all(
        res.data.map(async ticket => ({
            firstname: ticket.firstname,
            lastname: ticket.name,
            mail: ticket.email || ticket.order_email,
            username: await username(ticket.firstname, ticket.name),
            credit: getCredit(res, ticket),
            ticketId: ticket.barcode,
            physicalId: ticket.ext_id
        }))
    );
};
