const express = require('express');
const log = require('../../lib/log')(module);
const fetchTicket = require('../../lib/fetchTicket');
const dbCatch = require('../../lib/dbCatch');
const APIError = require('../../errors/APIError');

/**
 * Assigner controller. Handles cards assignment
 */
const router = new express.Router();

router.get('/services/assigner', (req, res, next) => {
    const ticketOrMail = req.query.ticketOrMail;

    if (!ticketOrMail || ticketOrMail.length === 0) {
        return next(new APIError(module, 400, 'Invalid ticketOrMail'));
    }

    log.info(`Search results for ticket ${ticketOrMail}`, req.details);

    fetchTicket(req.app.locals.models, ticketOrMail)
        .then(user =>
            res
                .status(200)
                .json([user])
                .end()
        )
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
