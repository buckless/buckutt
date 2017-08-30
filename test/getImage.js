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

const url = `http://localhost:${config.http.port}/image/${guid}`;

describe('Image getter', () => {
    before(() => {
        return app
            .start()
            .then(() => axios.post(url, { image }))
    });

    it('should get an image', () => {
        return axios
            .get(url)
            .then((res) => {
                assert.equal(res.data.image, png);
            });
    });

    it('should return the original image back', () => {
        return axios
            .get(url, { params: { format: 'webp' } })
            .then((res) => {
                assert.equal(res.data.image, webp);
            });
    });

    it('should resize the image', () => {
        return axios
            .get(url, { params: { width: 200, height: 200 } })
            .then((res) => {
                assert.equal(res.data.image, bigImage);
            });
    });

    after(() => {
        rimraf.sync(imagesPath);

        return app.stop();
    });
});
