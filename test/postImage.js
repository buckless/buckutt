const path           = require('path');
const assert         = require('assert');
const axios          = require('axios');
const rimraf         = require('rimraf');
const config         = require('../config');
const app            = require('../src/app');
const imagesPath     = require('../src/lib/imagesPath');
const { fileExists } = require('../src/lib/utils');

const {
    guid,
    image,
    png,
    webp,
    bigImage
} = require('./testData');

const url = `http://localhost:${config.http.port}/image/${guid}`;
const invalidUrl = `http://localhost:${config.http.port}/image/foo`;

describe('Image setter', () => {
    before(() => app.start());

    it('should post an image', () => {
        return axios
            .post(url, { image })
            .then((res) => {
                assert.equal(200, res.status);

                return fileExists(path.join(imagesPath, `${guid}.png`));
            });
    });

    it('should refuse with invalid guid', () => {
        return axios
            .post(invalidUrl, { image })
            .catch(({ response }) => {
                assert.equal(400, response.status);
                assert.equal('INVALID_GUID', response.data.error);
            });
    });

    it('should refuse without image', () => {
        return axios
            .post(url)
            .catch(({ response }) => {
                assert.equal(400, response.status);
                assert.equal('MISSING_IMAGE', response.data.error);
            });
    });

    it('should refuse without wrong buffer', () => {
        return axios
            .post(url, { image: 'foobar' })
            .catch(({ response }) => {
                assert.equal(400, response.status);
                assert.equal('INVALID_IMAGE', response.data.error);
            });
    });

    after(() => {
        rimraf.sync(imagesPath);

        return app.stop();
    });
});
