const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function generateToken(data) {
    const secret = config.app.secret;
    const tokenOptions = {
        expiresIn: '30d' // 30 days token
    };

    return jwt.sign(data, config.app.secret, tokenOptions);
};
