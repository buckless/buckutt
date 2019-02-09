const jwt = require('jsonwebtoken');
const config = require('@/config');

module.exports = data => jwt.sign(data, config.app.secret, { expiresIn: '30d' });
