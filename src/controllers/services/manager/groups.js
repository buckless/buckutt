const express = require('express');
const dbCatch = require('../../../lib/dbCatch');
const log = require('../../../lib/log')(module);

const router = new express.Router();

router.get('/services/manager/groups', (req, res, next) => {
    if (!req.user) {
        return res
            .status(200)
            .json({})
            .end();
    }

    const models = req.app.locals.models;

    return models.Group.where('id', '!=', req.event.defaultGroup_id)
        .fetchAll()
        .then(groups_ => groups_.toJSON())
        .then(groups =>
            res
                .status(200)
                .json(
                    groups.map(group => ({
                        id: group.id,
                        name: group.name
                    }))
                )
                .end()
        )
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
