const path       = require('path');
const express    = require('express');
const sharp      = require('sharp');
const log        = require('../lib/log')(module);
const imagesPath = require('../lib/imagesPath');
const {
    isGuid,
    fileExists
} = require('../lib/utils');

const router = new express.Router();

router.get('/image/:guid', (req, res, next) => {
    const filename = `${req.params.guid}.png`;
    const imagePath = path.join(imagesPath, filename);

    fileExists(imagePath)
        .then((exists) => {
            if (!exists) {
                return res
                    .status(404)
                    .json({ error: 'NOT_FOUND' })
                    .end();
            }

            let image = sharp(imagePath);

            if (req.query.width && req.query.height) {
                // TODO: ensure width/height numbers
                const w = parseInt(req.query.width, 10);
                const h = parseInt(req.query.height, 10);

                image = image
                    .resize(w, h)
                    .embed();
            }

            if (req.query.format) {
                // TODO: validate among ['jpeg', 'png', 'webp']
                image = image
                    .toFormat(req.query.format);
            }

            log.debug(`querying ${req.params.guid}`, req.query);

            return image.toBuffer();
        })
        .then((buf) => {
            const format = req.query.format || 'png';
            const image = `data:image/${format};base64,${buf.toString('base64')}`;

            res
                .status(200)
                .send({ image })
                .end();
        })
        .catch((err) => {
            next(err);
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
