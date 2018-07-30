const express = require('express');
const idParser = require('../lib/idParser');
const log = require('../lib/log')(module);
const modelParser = require('../lib/modelParser');
const { embedParser, embedFilter } = require('../lib/embedParser');
const dbCatch = require('../lib/dbCatch');

/**
 * Update controller. Handles updating one element.
 */
const router = new express.Router();

router.put('/:model/:id', (req, res, next) => {
    req.details.model = req.params.model;
    req.details.modelId = req.params.id;
    req.details.body = req.body;

    // First, get the model
    req.Model.where({ id: req.params.id })
        .fetch()
        .then(inst => {
            const previous = inst.toJSON();

            // Update based on body values
            Object.keys(req.body).forEach(key => {
                inst.set(key, req.body[key]);
            });

            // Has to be set manually because of the previous select
            inst.set('updated_at', new Date());

            req.app.locals.pub.publish(
                'data',
                JSON.stringify({
                    action: 'update',
                    model: modelParser.modelsNames[req.params.model],
                    data: { from: previous, to: inst.toJSON() }
                })
            );

            return inst.save();
        })
        .then(result => {
            // Embed multiple relatives
            const withRelated = req.query.embed ? embedParser(req.query.embed) : [];

            return req.Model.where({ id: result.id }).fetch({ withRelated });
        })
        .then(result => {
            const embedFilters = req.query.embed
                ? req.query.embed.filter(rel => rel.required).map(rel => rel.embed)
                : [];

            log.info(`Update ${req.params.model}(${req.params.id})`, req.details);

            res
                .status(200)
                .json(embedFilter(embedFilters, [result.toJSON()])[0])
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.param('model', modelParser);
router.param('id', idParser);

module.exports = router;
