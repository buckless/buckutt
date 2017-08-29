const fs         = require('fs');
const path       = require('path');
const express    = require('express');
const sharp      = require('sharp');
const { isGuid } = require('../lib/utils');
const log        = require('../lib/log')(module);

const router = new express.Router();

const imagesPath = path.resolve(__dirname, '..', '..', 'images');

const base64header = /^data:image\/(\w+);base64,/;

router.post('/image/:guid', (req, res, next) => {
    if (!req.body.image) {
        return res
            .status(400)
            .json({ error: 'MISSING_IMAGE' })
            .end();
    }

    let image = req.body.image;

    // we're going to test on sliced image to avoid regex on a bytes of data
    const match = image.slice(0, 25).match(base64header)

    if (!match) {
        return res
            .status(400)
            .json({ error: 'INVALID_IMAGE' })
            .end();
    }

    // match[0] is what matched (ie. data:image/jpeg;base64,)
    // match[1] is file type

    const filename = `${req.params.guid}.${match[1]}`;

    image = Buffer.from(image.slice(match[0].length), 'base64');

    image = sharp(image)
        .png()
        .toFile(path.join(imagesPath, filename))
        .then(() => {
            res
                .status(200)
                .json({ })
                .end();
        })
        .catch((err) => {
            log.error('upload failed', err);
            res
                .status(400)
                .json({ error: 'INVALID_IMAGE' })
                .end();
        });
});

router.param('guid', (req, res, next, value) => {
    if (isGuid(value)) {
        return next();
    }

    return res
        .status(400)
        .json({ error: 'INVALID_GUID' })
        .end();
});

module.exports = router;
