const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const log = require('server/app/log')(module);
const ctx = require('server/app/utils/ctx');
const modelParser = require('server/app/utils/modelParser');
const idParser = require('server/app/utils/idParser');

const { create, read, update, del } = require('server/app/actions/crud');
const {
    createRelative,
    readRelative,
    deleteRelative
} = require('server/app/actions/crud/relative');

// fill req.crud with (withRelated, embedFilters, filters)
router.use(require('server/app/middlewares/crud'));

// create
router.post(
    '/:model',
    asyncHandler(async (req, res) => {
        req.details.body = req.body;

        const insts = Array.isArray(req.body)
            ? req.body.map(data => new req.model(data))
            : [new req.model(req.body)];

        log.info(`create ${req.params.model}`, req.details);

        const results = await create(ctx(req), insts, req.crud);

        res.json(results.length === 1 ? results[0] : results);
    })
);

// read
router.get(
    '/:model/:id?',
    asyncHandler(async (req, res) => {
        req.details.query = req.query;
        req.details.params = req.params;

        const id = req.params.id;

        log.info(`read ${req.params.model}`, req.details);

        const results = await read(ctx(req), {
            id,
            ...req.crud
        });

        res.json(id ? results[0] : results);
    })
);

// update
router.put(
    '/:model/:id',
    asyncHandler(async (req, res) => {
        req.details.model = req.params.model;
        req.details.modelId = req.params.id;
        req.details.body = req.body;

        const { id, model } = req.params;
        const data = req.body;

        log.info(`update ${req.params.model}(${id})`, req.details);

        const results = await update(ctx(req), {
            id,
            model,
            data,
            ...req.crud
        });

        res.json(results);
    })
);

// delete
router.delete(
    '/:model/:id',
    asyncHandler(async (req, res) => {
        log.info(`delete ${req.params.model} ${req.params.id}`, req.details);

        await del(ctx(req), req.params.id);

        res.json({});
    })
);

// relative - read
router.get(
    '/:model/:id/:submodel',
    asyncHandler(async (req, res) => {
        req.details.query = req.query;
        req.details.model = req.params.model;
        req.details.modelId = req.params.id;
        req.details.submodel = req.params.submodel;

        const { id, submodel } = req.params;
        let { withRelated, embedFilters } = req.crud;

        withRelated = [submodel].concat(withRelated);

        log.info(`read relatives ${submodel} of ${req.params.model}`, req.details);

        const results = await readRelative(ctx(req), {
            id,
            submodel,
            embedFilters,
            withRelated
        });

        res.json(results);
    })
);

// relative - post
router.post(
    '/:model/:id/:submodel/:subId',
    asyncHandler(async (req, res) => {
        req.details.query = req.query;
        req.details.model = req.params.model;
        req.details.modelId = req.params.id;
        req.details.submodel = req.params.submodel;
        req.details.submodelId = req.params.subId;

        const { id, subId, submodel } = req.params;

        log.info(
            `create relative ${submodel}(${subId}) of ${req.params.model}(${id})`,
            req.details
        );

        await createRelative(ctx(req), { submodel, id, subId });

        res.json({});
    })
);

// relative - delete
router.delete(
    '/:model/:id/:submodel/:subId',
    asyncHandler(async (req, res) => {
        req.details.query = req.query;
        req.details.model = req.params.model;
        req.details.modelId = req.params.id;
        req.details.submodel = req.params.submodel;
        req.details.submodelId = req.params.subId;

        const { submodel, id, subId } = req.params;

        log.info(
            `delete relative ${submodel}(${subId}) of ${req.params.model}(${id})`,
            req.details
        );

        await deleteRelative(ctx(req), { submodel, id, subId });

        res.json({});
    })
);

router.param('id', idParser);
router.param('model', modelParser);

module.exports = router;
