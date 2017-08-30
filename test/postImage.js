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

describe('Image setter', () => {
    before(() => {
        return app.start();
    });

    it('should post an image', () => {
        return axios
            .post(url, { image })
            .then((res) => {
                assert.equal(200, res.status);

                return fileExists(path.join(imagesPath, `${guid}.png`));
            });
    });

    after(() => {
        rimraf.sync(imagesPath);

        return app.stop();
    });
});
