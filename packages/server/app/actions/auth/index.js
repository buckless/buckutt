const { validateLoginBody, login } = require('./login');
const { checkDevice, registerDevice } = require('./checkDevice');
const fetchTicket = require('./fetchTicket');

module.exports = {
    checkDevice,
    registerDevice,
    validateLoginBody,
    login,
    fetchTicket
};
