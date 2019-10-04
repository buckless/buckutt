const axios = require('axios');

const config = require('server/app/config').assigner.etupay;

const url = `${config.url}/billets?api_key=${config.key}`;

const getCredit = ticket => {
    return ticket.options
        .filter(option => option.name.toLowerCase().indexOf('cashless') > -1)
        .map(option => option.price)
        .reduce((a, b) => a + b, 0);
};

module.exports = async function etupay() {
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
            amount: getCredit(ticket),
            logical_id: ticket.qrcode,
            physical_id: ticket.uuid
        }))
    );
};
