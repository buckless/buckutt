const getSupportDetails = require('./getSupportDetails');
const getAccountFromCard = require('./getAccountFromCard');
const fetchFromAPI = require('../ticketProviders');
const fetchTicket = require('./fetchTicket');
const rightsDetails = require('./rightsDetails');
const APIError = require('../errors/APIError');

module.exports = async function assignParser(req) {
    let targetUser;
    let checkMail;
    const meansOfLogin = [];
    const reloads = [];
    let groupsToAdd = [req.event.defaultGroup_id];

    // If the ticketNumber is provided, fetch informations about the account & create related mols
    if (req.body.ticketNumber && req.body.ticketNumber.length > 0) {
        const userData = await fetchTicket(req.app.locals.models, req.body.ticketNumber);

        // If from API: don't recreate the mol
        if (!userData.id) {
            meansOfLogin.push({
                type: 'ticketId',
                data: userData.ticketId,
                physical_id: userData.physicalId
            });
        }

        if (typeof userData.credit === 'number' && userData.credit > 0 && !userData.id) {
            reloads.push({
                credit: userData.credit,
                type: 'card',
                trace: userData.ticketId
            });

            const GiftReload = req.app.locals.models.GiftReload;
            const giftReloads = await GiftReload.fetchAll()
                .then(
                    giftReloads_ =>
                        giftReloads_ && giftReloads_.length ? giftReloads_.toJSON() : []
                );

            const reloadGiftAmount = giftReloads
                .filter(gr => userData.credit >= gr.minimalAmount)
                .map(gr => Math.floor(userData.credit / gr.everyAmount) * gr.amount)
                .reduce((a, b) => a + b, 0);

            if (reloadGiftAmount > 0) {
                reloads.push({
                    credit: reloadGiftAmount,
                    type: 'gift',
                    trace: userData.ticketId
                });
            }
        }

        // The ticket credit is already added by a reload
        userData.credit = 0;
        targetUser = userData;
    }

    const userRights = rightsDetails(req.user, req.point.id);
    const isFromAssigner = userRights.assign;
    let cardAccount;

    if (req.body.cardId) {
        cardAccount = await getAccountFromCard(req.app.locals.models, req.body.cardId);
    }

    // If the request comes from manager
    if (!targetUser && !req.user && req.body.firstname && req.body.lastname && req.body.mail) {
        // If the user hasn't been generated from the ticket, REGISTER FROM MANAGER
        checkMail = true;

        targetUser = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            mail: req.body.mail
        };
    } else if (req.body.userId && req.user) {
        // If a userId is provided and the user logged, ASSIGNER FROM MANAGER
        targetUser = req.user;
    }
    // Else: REGISTER FROM MANAGER (ticket) - OR REJECT

    if (userRights.assign) {
        // If the user has assigner rights, do some extra checks
        if (req.body.userId) {
            // Check if a userId isn't already provided, ASSIGNER FROM ASSIGNER
            targetUser = {
                id: req.body.userId
            };
        } else if (cardAccount) {
            // If the card is already assigned, assign to the account, ASSIGNER FROM ASSIGNER
            targetUser = cardAccount;
        } else if (req.body.anon) {
            // Authorize assigner to create an anonymous account, REGISTER FROM ASSIGNER
            targetUser = { credit: req.body.credit || 0 };
        }
        // Else: REGISTER FROM ASSIGNER (ticket) - OR REJECT

        // Authorize assigner to add memberships
        if (req.body.groups) {
            groupsToAdd = groupsToAdd.concat(req.body.groups);
        }
    }

    if (!targetUser) {
        return Promise.reject(new APIError(module, 400, 'Invalid data'));
    }

    // If a physical card number is provided, link it
    const assignCard =
        (req.body.physicalId && req.body.physicalId.length > 0) ||
        (req.body.cardId && req.body.cardId.length > 0);

    if (assignCard && !cardAccount) {
        const supportDetails = await getSupportDetails(req.app.locals.models, {
            logical_id: req.body.cardId,
            physical_id: req.body.physicalId
        });

        if (supportDetails) {
            meansOfLogin.push({
                type: 'cardId',
                physical_id: supportDetails.physical_id,
                data: supportDetails.logical_id,
                blocked: false
            });
        } else if (assignCard) {
            return Promise.reject(new APIError(module, 404, 'Physical support not found'));
        }
    }

    // Check the mail if needed
    if (checkMail) {
        const mols = await req.app.locals.models.MeanOfLogin.where({
            blocked: false,
            type: 'mail',
            data: targetUser.mail
        })
            .fetchAll({
                withRelated: ['user']
            })
            .then(mols => mols.toJSON());

        if (mols.length > 0) {
            return Promise.reject(
                new APIError(module, 403, 'User mail exists', { body: req.body })
            );
        }
    }

    return {
        groupsToAdd,
        targetUser,
        reloads,
        meansOfLogin
    };
};
