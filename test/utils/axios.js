const axios = require('axios');

module.exports = () => {
    return axios.create({
        baseURL: 'https://localhost:3006'
    });
};
