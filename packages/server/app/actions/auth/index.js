const { validateLoginBody, login } = require('./login');
const { checkDevice, registerDevice } = require('./checkDevice');
const { assigner } = require('./assigner');
const { validateTicket } = require('./validateTicket');
const fetchTicket = require('./fetchTicket');

module.exports = {
    checkDevice,
    registerDevice,
    validateLoginBody,
    login,
    fetchTicket,
    assigner,
    validateTicket
};
