const assert     = require('assert');
const axios      = require('axios');
const rimraf     = require('rimraf');
const config     = require('../config');
const app        = require('../src/app');
const imagesPath = require('../src/lib/imagesPath');

const {
    guid,
    wrongGuid,
    image,
    png,
    webp,
    bigImage
} = require('./testData');

const url = `http://localhost:${config.http.port}/image/${guid}`;
const wrongUrl = `http://localhost:${config.http.port}/image/${wrongGuid}`;
const invalidUrl = `http://localhost:${config.http.port}/image/foo`;

describe('Image getter', () => {
    before(() => app
        .start()
        .then(() => axios.post(url, { image })));

    it('should get an image', () => axios
        .get(url)
        .then((res) => {
            assert.equal(res.data.image, png);
        }));

    it('should return the original image back', () => axios
        .get(url, { params: { format: 'webp' } })
        .then((res) => {
            assert.equal(res.data.image, webp);
        }));

    it('should resize the image', () => axios
        .get(url, { params: { width: 200, height: 200 } })
        .then((res) => {
            assert.equal(res.data.image, bigImage);
        }));

    it('should refuse request with unknown guid', () => axios
        .get(wrongUrl)
        .catch(({ response }) => {
            assert.equal(404, response.status);
            assert.equal('NOT_FOUND', response.data.error);
        }));

    it('should refuse request with invalid guid', () => axios
        .get(invalidUrl)
        .catch(({ response }) => {
            assert.equal(400, response.status);
            assert.equal('INVALID_GUID', response.data.error);
        }));

    it('should refuse request with wrong format', () => axios
        .get(url, { params: { format: 'foo' } })
        .catch(({ response }) => {
            assert.equal(400, response.status);
            assert.equal('INVALID_FORMAT', response.data.error);
        }));

    it('should refuse request with wrong size', () => axios
        .get(url, { params: { width: 'foo', height: 'foo' } })
        .catch(({ response }) => {
            assert.equal(400, response.status);
            assert.equal('INVALID_SIZE', response.data.error);
        }));

    after(() => {
        rimraf.sync(imagesPath);

        return app.stop();
    });
});
