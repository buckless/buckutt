const path = require('path');
const express = require('express');
const jimp = require('jimp');
const { isInt, isIn } = require('validator');
const log = require('../lib/log')(module);
const imagesPath = require('../lib/imagesPath');
const { isGuid, fileExists } = require('../lib/utils');

const router = new express.Router();

router.get('/image/:guid', (req, res) => {
    const filename = `${req.params.guid}.png`;
    const imagePath = path.join(imagesPath, filename);

    fileExists(imagePath)
        .then(() => jimp.read(imagePath))
        .then(image => {
            let mime = `image/${image.getExtension()}`;

            if (req.query.size) {
                if (!isInt(req.query.size)) {
                    return res
                        .status(400)
                        .send({ error: 'INVALID_SIZE' })
                        .end();
                }

                const size = parseInt(req.query.size, 10);

                image = image.resize(size, jimp.AUTO);
            }

            if (req.query.format) {
                if (!isIn(req.query.format, ['jpeg', 'png'])) {
                    return res
                        .status(400)
                        .send({ error: 'INVALID_FORMAT' })
                        .end();
                }

                if (req.query.format === 'jpeg') {
                    image = image.background(0xffffffff);
                }

                mime = `image/${req.query.format}`;
            }

            log.debug(`querying ${req.params.guid}`, req.query);

            return image.getBufferAsync(mime).then(buf => {
                const format = req.query.format || 'png';
                const dataImage = `data:image/${format};base64,${buf.toString('base64')}`;

                res.status(200)
                    .send({ image: dataImage })
                    .end();
            });
        })
        .catch(err => {
            console.log(err);
            log.error(`couldn't find image ${req.params.guid}`, err);

            return res
                .status(404)
                .send({ error: 'NOT_FOUND' })
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
