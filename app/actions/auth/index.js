const { validateLoginBody, login } = require('./login');
const fetchTicket = require('./fetchTicket');

module.exports = {
    validateLoginBody,
    login,
    fetchTicket
};
