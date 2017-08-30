const path            = require('path');
const express         = require('express');
const sharp           = require('sharp');
const { isInt, isIn } = require('validator');
const log             = require('../lib/log')(module);
const imagesPath      = require('../lib/imagesPath');
const {
    isGuid,
    fileExists
} = require('../lib/utils');

const router = new express.Router();

router.get('/image/:guid', (req, res) => {
    const filename = `${req.params.guid}.png`;
    const imagePath = path.join(imagesPath, filename);

    fileExists(imagePath)
        .then(() => {
            let image = sharp(imagePath);

            if (req.query.width && req.query.height) {
                if (!isInt(req.query.width) || !isInt(req.query.height)) {
                    return res
                        .status(400)
                        .send({ error: 'INVALID_SIZE' })
                        .end();
                }

                const w = parseInt(req.query.width, 10);
                const h = parseInt(req.query.height, 10);

                image = image
                    .resize(w, h)
                    .embed();
            }

            if (req.query.format) {
                if (!isIn(req.query.format, ['jpeg', 'png', 'webp'])) {
                    return res
                        .status(400)
                        .send({ error: 'INVALID_FORMAT' })
                        .end();
                }

                image = image.toFormat(req.query.format);
            }

            log.debug(`querying ${req.params.guid}`, req.query);

            return image
                .toBuffer()
                .then((buf) => {
                    const format = req.query.format || 'png';
                    const image = `data:image/${format};base64,${buf.toString('base64')}`;

                    res
                        .status(200)
                        .send({ image })
                        .end();
                })
        })
        .catch((err) => {
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
