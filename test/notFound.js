const assert     = require('assert');
const axios      = require('axios');
const rimraf     = require('rimraf');
const config     = require('../config');
const app        = require('../src/app');
const imagesPath = require('../src/lib/imagesPath');

const {
    guid,
    image,
    png,
    webp,
    bigImage
} = require('./testData');

const url = `http://localhost:${config.http.port}/foo`;

describe('Not found', () => {
    before(() => app.start());

    it('should 404 if path is not /image/guid', () => {
        return axios
            .get(url)
            .catch(({ response }) => {
                assert.equal(404, response.status);
            });
    });

    after(() => app.stop());
});
