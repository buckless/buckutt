const path = require('path');
const express = require('express');
const jimp = require('jimp');
const log = require('../lib/log')(module);
const imagesPath = require('../lib/imagesPath');
const { isGuid, base64ImageToBuffer } = require('../lib/utils');

const router = new express.Router();

router.post('/image/:guid', (req, res) => {
    if (!req.body.image) {
        return res
            .status(400)
            .json({ error: 'MISSING_IMAGE' })
            .end();
    }

    let image = base64ImageToBuffer(req.body.image);

    if (!image) {
        return res
            .status(400)
            .json({ error: 'INVALID_IMAGE' })
            .end();
    }

    const filename = `${req.params.guid}.png`;

    jimp.read(image.buffer)
        .then(image => image.writeAsync(path.join(imagesPath, filename)))
        .then(() => {
            log.info(`writing ${req.params.guid}`);

            res.status(200)
                .json({})
                .end();
        })
        .catch(
            /* istanbul ignore next */ err => {
                console.log(err);
                log.error('upload failed', err);

                res.status(400)
                    .json({ error: 'INVALID_IMAGE' })
                    .end();
            }
        );
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
