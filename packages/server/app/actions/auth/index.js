const { validateLoginBody, login } = require('./login');
const { checkDevice, registerDevice } = require('./checkDevice');
const { assigner } = require('./assigner');
const fetchTicket = require('./fetchTicket');

module.exports = {
    checkDevice,
    registerDevice,
    validateLoginBody,
    login,
    fetchTicket,
    assigner
};
