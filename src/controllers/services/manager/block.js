const express = require('express');
const dbCatch = require('../../../lib/dbCatch');
const { bookshelf } = require('../../../lib/bookshelf');
const log = require('../../../lib/log')(module);

/**
 * Block controller.
 */
const router = new express.Router();

router.put('/services/manager/block', (req, res, next) => {
    bookshelf
        .knex('meansoflogin')
        .where({
            user_id: req.user.id,
            type: 'cardId'
        })
        .update({
            blocked: true,
            updated_at: new Date()
        })
        .then(() => {
            log.info(`User ${req.user.id} blocked his cards`);

            res
                .status(200)
                .json({ blocked: true })
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
