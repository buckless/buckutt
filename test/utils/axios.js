const axios = require('axios');

module.exports = axios.create({
    baseURL: 'http://localhost:3006/api/v1',
    headers: {
        'X-Fingerprint': 'admin'
    }
});
