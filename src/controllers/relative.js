const express = require('express');
const idParser = require('../lib/idParser');
const log = require('../lib/log')(module);
const modelParser = require('../lib/modelParser');
const { embedParser, embedFilter } = require('../lib/embedParser');
const dbCatch = require('../lib/dbCatch');
const APIError = require('../errors/APIError');

/**
 * Read submodel controller. Handles reading the children of one element (based on a relation).
 */
const router = new express.Router();

router.get('/:model/:id/:submodel', (req, res, next) => {
    req.details.query = req.query;
    req.details.model = req.params.model;
    req.details.modelId = req.params.id;
    req.details.submodel = req.params.submodel;

    const submodel = req.params.submodel;

    let withRelated = [];
    if (req.query.embed) {
        withRelated = [submodel].concat(embedParser(req.query.embed));
    } else {
        withRelated = [submodel];
    }

    const embedFilters = req.query.embed
        ? req.query.embed.filter(rel => rel.required).map(rel => rel.embed)
        : [];

    req.Model.where({ id: req.params.id })
        .fetch({ withRelated })
        .then(result => (result ? embedFilter(embedFilters, [result.toJSON()])[0] : null))
        .then(instance => {
            if (!instance || !instance[submodel]) {
                return next(new APIError(module, 404, 'Document not found'));
            }

            log.info(`Read relatives ${req.params.submodel} of ${req.params.model}`, req.details);

            res
                .status(200)
                .json(instance[submodel])
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/:model/:id/:submodel/:subId', (req, res, next) => {
    req.details.query = req.query;
    req.details.model = req.params.model;
    req.details.modelId = req.params.id;
    req.details.submodel = req.params.submodel;
    req.details.submodelId = req.params.subId;

    const Model = req.Model;
    const { id, subId, submodel } = req.params;

    // create empty instance
    const forged = new req.Model();

    if (!forged[submodel] || !forged[submodel]().attach) {
        return next(
            new APIError(module, 404, 'Document not found: submodel does not exist', { submodel })
        );
    }

    // get relationship data
    const relationship = forged[submodel]();

    // extract submodel class
    const SubModel = relationship.model;

    let left;

    Model.where({ id })
        .fetch()
        .then(left_ => {
            left = left_;

            if (!left) {
                return Promise.reject(new APIError(module, 404, 'Left document does not exist'));
            }

            return SubModel.where({ id: subId }).fetch();
        })
        .then(right => {
            if (!right) {
                return Promise.reject(new APIError(module, 404, 'Right document does not exist'));
            }

            return left[submodel]().attach(right);
        })
        .then(() => {
            log.info(
                `Create relative ${req.params.submodel}(${req.params.subId}) of
                ${req.params.model}(${req.params.id})`,
                req.details
            );

            res
                .status(200)
                .json({})
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

router.delete('/:model/:id/:submodel/:subId', (req, res, next) => {
    req.details.query = req.query;
    req.details.model = req.params.model;
    req.details.modelId = req.params.id;
    req.details.submodel = req.params.submodel;
    req.details.submodelId = req.params.subId;

    const Model = req.Model;
    const { id, subId, submodel } = req.params;

    // create empty instance
    const forged = new req.Model();

    if (!forged[submodel]) {
        return next(
            new APIError(module, 404, 'Document not found: submodel does not exist', { submodel })
        );
    }

    // get relationship data
    const relationship = forged[submodel]();

    // extract submodel class
    const SubModel = relationship.model;

    let left;
    let right;

    Model.where({ id })
        .fetch()
        .then(left_ => {
            left = left_;

            if (!left) {
                return Promise.reject(new APIError(module, 404, 'Left document does not exist'));
            }

            return SubModel.where({ id: subId }).fetch();
        })
        .then(right_ => {
            right = right_;

            if (!right) {
                return Promise.reject(new APIError(module, 404, 'Right document does not exist'));
            }

            return left[submodel]().detach(right);
        })
        .then(() => {
            // req.app.locals.modelChanges.emit(
            //     'data',
            //     'create',
            //     modelParser.modelsNames[req.params.model],
            //     { from: null, to: right }
            // );

            log.info(
                `Delete relative ${req.params.submodel}(${req.params.subId}) of
                ${req.params.model}(${req.params.id})`,
                req.details
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
router.param('subId', idParser);

module.exports = router;
