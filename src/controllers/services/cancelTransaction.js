const express = require('express');
const { bookshelf } = require('../../lib/bookshelf');
const creditUser = require('../../lib/creditUser');
const APIError = require('../../errors/APIError');
const log = require('../../lib/log')(module);
const dbCatch = require('../../lib/dbCatch');

const getPriceAmount = (Price, priceId) =>
    Price.where({ id: priceId })
        .fetch()
        .then(price => price.get('amount'));

const getUserInst = (User, userId) => User.where({ id: userId }).fetch();

/**
 * CancelTransaction controller. Cancel purchases, reloads, refunds and transfers
 */
const router = new express.Router();

router.post('/services/cancelTransaction', (req, res, next) => {
    const transactionModels = {
        transfer: 'Transfer',
        reload: 'Reload',
        purchase: 'Purchase',
        promotion: 'Purchase',
        refund: 'Refund'
    };

    const currentModel = transactionModels[req.body.rawType];

    if (!currentModel) {
        return next(new APIError(module, 400, 'Invalid transaction type'));
    }

    return req.app.locals.models[currentModel]
        .where({ id: req.body.id })
        .fetch()
        .then(transaction => (transaction ? transaction.toJSON() : null))
        .then(transaction => {
            if (!transaction) {
                return next(new APIError(module, 404, 'Transaction not found'));
            }

            req.transaction = {
                model: currentModel,
                data: transaction
            };

            next();

            return Promise.resolve();
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/cancelTransaction', (req, res, next) => {
    const models = req.app.locals.models;
    // Don't check if from client and card data are used
    const checkApiCredit = req.point.name === 'Internet' || !req.event.useCardData;

    let amountPromise;
    switch (req.transaction.model) {
        case 'Purchase':
            amountPromise = getPriceAmount(models.Price, req.transaction.data.price_id);
            break;
        case 'Reload':
            amountPromise = Promise.resolve(req.transaction.data.credit);
            break;
        default:
            amountPromise = Promise.resolve(req.transaction.data.amount);
    }

    amountPromise
        .then(amount => {
            req.pendingCardUpdates = {};

            if (req.transaction.model === 'Purchase' || req.transaction.model === 'Refund') {
                getUserInst(models.User, req.transaction.data.buyer_id).then(user => {
                    req.pendingCardUpdates[user.id] = amount;

                    next();
                });
            } else if (req.transaction.model === 'Reload') {
                getUserInst(models.User, req.transaction.data.buyer_id).then(user => {
                    if (user.get('credit') - amount < 0 && checkApiCredit) {
                        return next(new APIError(module, 403, "User doesn't have enough credit"));
                    }

                    req.pendingCardUpdates[user.id] = -1 * amount;

                    next();
                });
            } else {
                getUserInst(models.User, req.transaction.data.sender_id)
                    .then(user => {
                        if (user.get('credit') - amount < 0 && checkApiCredit) {
                            return next(
                                new APIError(module, 403, "User doesn't have enough credit")
                            );
                        }

                        req.pendingCardUpdates[user.id] = -1 * amount;

                        return getUserInst(models.User, req.transaction.data.reciever_id);
                    })
                    .then(user => {
                        req.pendingCardUpdates[user.id] = amount;

                        next();
                    });
            }
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/cancelTransaction', (req, res, next) => {
    const queries = Object.keys(req.pendingCardUpdates).map(user =>
        creditUser(req, user, req.pendingCardUpdates[user])
    );

    const Model = req.app.locals.models[req.transaction.model];

    Promise.all(queries)
        .then(() =>
            new Model({ id: req.transaction.data.id }).save(
                { clientDeletion: req.body.clientTime },
                { patch: true }
            )
        )
        .then(() => new Model({ id: req.transaction.data.id }).destroy())
        .then(() => {
            req.details.rawType = req.body.rawType;
            req.details.objectId = req.body.id;
            req.details.clientTime = req.body.clientTime;

            log.info(`Canceling ${req.body.rawType} ${req.body.id}`, req.details);

            res
                .status(200)
                .json({})
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
