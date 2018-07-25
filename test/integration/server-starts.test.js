const assert       = require('assert');
const axiosFactory = require('../utils/axios');

const startServer = require('../utils/startServer');

describe('Should start the test application', () => {
    before(function () {
        this.timeout(30 * 1000);
        return startServer();
    });

    it('should listen', () => axiosFactory().get('/'));
});
