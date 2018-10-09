const axios = require('axios');
const username = require('@/helpers/username');

const config = require('@/config').assigner.billetweb;

const url = `${config.url}/${config.key}/billets`;

const getCredit = ticket => {
    return ticket.options
        .filter(option => option.name.toLowerCase().indexOf('cashless') > -1)
        .map(option => option.price)
        .reduce((a, b) => a + b, 0);
};

module.exports = async () => {
    if (!config.url || !config.key) {
        return [];
    }

    const res = await axios.get(url);

    if (!Array.isArray(res.data) || !res.data.length) {
        return [];
    }

    return Promise.all(
        res.data.map(async ticket => ({
            firstname: ticket.surname,
            lastname: ticket.name,
            mail: ticket.mail,
            username: await username(ticket.surname, ticket.name),
            credit: getCredit(ticket),
            ticketId: ticket.qrcode,
            physicalId: ticket.uuid
        }))
    );
};
