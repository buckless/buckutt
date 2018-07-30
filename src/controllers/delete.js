const express = require('express');
const idParser = require('../lib/idParser');
const log = require('../lib/log')(module);
const modelParser = require('../lib/modelParser');
const dbCatch = require('../lib/dbCatch');

/**
 * Update controller. Handles updating one element.
 */
const router = new express.Router();

router.delete('/:model/:id', (req, res, next) => {
    log.info(`Delete ${req.params.model} ${req.params.id}`, req.details);

    // First, get the model
    new req.Model({ id: req.params.id })
        .destroy()
        .then(inst => {
            req.app.locals.pub.publish(
                'data',
                JSON.stringify({
                    action: 'delete',
                    model: modelParser.modelsNames[req.params.model],
                    data: { from: inst, to: null }
                })
            );

            res
                .status(200)
                .json({})
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.param('model', modelParser);
router.param('id', idParser);

module.exports = router;
