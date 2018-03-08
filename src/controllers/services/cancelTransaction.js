const express       = require('express');
const { bookshelf } = require('../../lib/bookshelf');
const APIError      = require('../../errors/APIError');
const rightsDetails = require('../../lib/rightsDetails');
const logger        = require('../../lib/log');
const dbCatch       = require('../../lib/dbCatch');

const log = logger(module);

const getPriceAmount = (Price, priceId) => Price
    .where({ id: priceId })
    .fetch()
    .then(price => price.get('amount'));

const getUserInst = (User, userId) => User
    .where({ id: userId })
    .fetch();

/**
 * CancelTransaction controller. Cancel purchases, reloads, refunds and transfers
 */
const router = new express.Router();

router.post('/services/cancelTransaction', (req, res, next) => {
    log.info(`Canceling ${req.body.rawType} ${req.body.id}`, req.details);

    const transactionModels = {
        transfer : 'Transfer',
        reload   : 'Reload',
        purchase : 'Purchase',
        promotion: 'Purchase',
        refund   : 'Refund'
    };

    const currentModel = transactionModels[req.body.rawType];

    if (!currentModel) {
        return next(new APIError(module, 400, 'Invalid transaction type'));
    }

    return req.app.locals.models[currentModel]
        .where({ id: req.body.id })
        .fetch()
        .then(transaction => (transaction ? transaction.toJSON() : null))
        .then((transaction) => {
            if (!transaction) {
                return next(new APIError(module, 404, 'Transaction not found'));
            }

            req.transaction = {
                model: currentModel,
                data : transaction
            };

            next();
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/cancelTransaction', (req, res, next) => {
    const models = req.app.locals.models;

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
        .then((amount) => {
            req.pendingCardUpdates = {};

            if (req.transaction.model === 'Purchase' || req.transaction.model === 'Refund') {
                getUserInst(models.User, req.transaction.data.buyer_id)
                    .then((user) => {
                        req.pendingCardUpdates[user.id] = amount;

                        next();
                    });
            } else if (req.transaction.model === 'Reload') {
                getUserInst(models.User, req.transaction.data.buyer_id)
                    .then((user) => {
                        if (user.get('credit') - amount < 0) {
                            return next(new APIError(module, 403, 'User doesn\'t have enough credit'));
                        }

                        req.pendingCardUpdates[user.id] = amount: -1 * amount;

                        next();
                    });
            } else {
                getUserInst(models.User, req.transaction.data.sender_id)
                    .then((user) => {
                        if (user.get('credit') - amount < 0) {
                            return next(new APIError(module, 403, 'User doesn\'t have enough credit'));
                        }

                        req.pendingCardUpdates[user.id] = -1 * amount;

                        return getUserInst(models.User, req.transaction.data.reciever_id);
                    })
                    .then((user) => {
                        req.pendingCardUpdates[user.id] = amount;

                        next();
                    });
            }
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/cancelTransaction', (req, res, next) => {
    const queries = [];

    Object.keys(req.pendingCardUpdates).forEach((user) => {
        let query;
        if (req.event.useCardData && req.query.addPendingCardUpdate && rightsDetails(req.user).admin) {
            query = new req.app.locals.models.PendingCardUpdate({
                user_id: user,
                amount : req.pendingCardUpdates[user]
            })
                .save()
                .then(() => ({
                    id     : user,
                    pending: req.pendingCardUpdates[user]
                }));
        } else {
            query = bookshelf
                .knex('users')
                .where({ id: user })
                .update({
                    updated_at: new Date(),
                    credit    : bookshelf.knex.raw(`credit + ${req.pendingCardUpdates[user]}`)
                })
                .returning('credit')
                .then(credit => ({
                    id: user,
                    credit
                }));
        }

        queries.push(query);
    });

    const Model = req.app.locals.models[req.transaction.model];

    Promise.all(queries)
        .then((results) => {
            results.forEach((result) => {
                req.app.locals.modelChanges.emit('userCreditUpdate', result);
            });

            return new Model({ id: req.transaction.data.id }).destroy();
        })
        .then(() =>
            res
                .status(200)
                .json({})
                .end())
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
