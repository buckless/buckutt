const jwt = require('jsonwebtoken');
const config = require('server/app/config');

module.exports = data => jwt.sign(data, config.app.secret, { expiresIn: '30d' });
