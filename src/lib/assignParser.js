const getSupportDetails = require('./getSupportDetails');
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
        if (userData.ticketId) {
            meansOfLogin.push({
                type: 'ticketId',
                data: userData.ticketId,
                physical_id: userData.physicalId
            });
        }

        if (typeof userData.credit === 'number' && userData.credit > 0 && !userData.ticketId) {
            reloads.push({
                credit: userData.credit,
                type: 'Préchargement',
                trace: userData.ticketId
            });
        } else {
            userData.credit = 0;
        }

        targetUser = userData;
    }

    const userRights = rightsDetails(req.user, req.point_id);
    const isFromAssigner = req.point.name !== 'Internet';

    if (!isFromAssigner) {
        // If the request comes from manager
        if (!targetUser && !req.user && req.body.firstname && req.body.lastname && req.body.mail) {
            // If the user hasn't been generated from the ticket, REGISTER FROM MANAGER
            checkMail = true;

            targetUser = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                mail: req.body.mail
            };
        } else if (req.user) {
            // If no information is provided and the user logged, ASSIGNER FROM MANAGER
            targetUser = req.user;
        }
        // Else: REGISTER FROM MANAGER (ticket) - OR REJECT
    } else if (userRights.assign) {
        // If the request comes from assigner & have assigner rights
        if (req.body.userId) {
            // Check if a userId isn't already provided, ASSIGNER FROM ASSIGNER
            targetUser = {
                id: req.body.userId
            };
        } else if (req.body.anon) {
            // Authorize assigner to create an anonymous account, REGISTER FROM ASSIGNER
            targetUser = { credit: req.body.credit || 0 };
        }
        // Else: REGISTER FROM ASSIGNER (ticket) - OR REJECT

        // Authorize assigner to add memberships
        if (req.body.groups) {
            groupsToAdd = groupsToAdd.concat(req.body.groups);
        }
    } else {
        return Promise.reject(new APIError(module, 401, 'No right to do that'));
    }

    if (!targetUser) {
        return Promise.reject(new APIError(module, 400, 'Invalid data'));
    }

    // If a physical card number is provided, link it
    const assignCard =
        (req.body.physicalId && req.body.physicalId.length > 0) ||
        (req.body.cardId && req.body.cardId.length > 0);
    if (assignCard) {
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
