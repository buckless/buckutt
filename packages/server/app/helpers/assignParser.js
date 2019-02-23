const getSupportDetails = require('server/app/helpers/getSupportDetails');
const getAccountFromCard = require('server/app/helpers/getAccountFromCard');
const fetchTicket = require('server/app/helpers/fetchTicket');
const rightsDetails = require('server/app/utils/rightsDetails');
const APIError = require('server/app/utils/APIError');

module.exports = async (
    ctx,
    ticketNumber,
    cardId,
    firstname,
    lastname,
    mail,
    userId,
    anon,
    credit,
    groups,
    physicalId
) => {
    let targetUser;
    let checkMail;
    const meansOfLogin = [];
    const reloads = [];
    let groupsToAdd = [ctx.event.defaultGroup_id];

    // if the ticketNumber is provided, fetch informations about the account & create related mols
    if (ticketNumber && ticketNumber.length > 0) {
        const userData = await fetchTicket(ctx, ticketNumber);

        // if from API: don't recreate the mol
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

            const giftReloads = await ctx.models.GiftReload.fetchAll().then(gr =>
                gr && gr.length ? gr.toJSON() : []
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

        // the ticket credit is already added by a reload
        userData.credit = 0;
        targetUser = userData;
    }

    const userRights = rightsDetails(ctx.user, ctx.point.id);
    // const isFromAssigner = userRights.assign;
    let cardAccount;

    if (cardId) {
        cardAccount = await getAccountFromCard(ctx, cardId);
    }

    // if the request comes from manager
    if (!targetUser && !ctx.user && firstname && lastname && mail) {
        // if the user hasn't been generated from the ticket, REGISTER FROM MANAGER
        checkMail = true;

        targetUser = {
            firstname: firstname,
            lastname: lastname,
            mail: mail
        };
    } else if (userId && ctx.user) {
        // if a userId is provided and the user logged, ASSIGNER FROM MANAGER
        targetUser = ctx.user;
    }
    // else: REGISTER FROM MANAGER (ticket) - OR REJECT

    if (userRights.assign) {
        // if the user has assigner rights, do some extra checks
        if (userId) {
            // check if a userId isn't already provided, ASSIGNER FROM ASSIGNER
            targetUser = {
                id: userId
            };
        } else if (cardAccount) {
            // if the card is already assigned, assign to the account, ASSIGNER FROM ASSIGNER
            targetUser = cardAccount;
        } else if (anon) {
            // authorize assigner to create an anonymous account, REGISTER FROM ASSIGNER
            targetUser = { credit: credit || 0 };
        }
        // else: REGISTER FROM ASSIGNER (ticket) - OR REJECT

        // authorize assigner to add memberships
        if (groups) {
            groupsToAdd = groupsToAdd.concat(groups);
        }
    }

    if (!targetUser) {
        throw new APIError(module, 400, 'Invalid data');
    }

    // if a physical card number is provided, link it
    const assignCard = (physicalId && physicalId.length > 0) || (cardId && cardId.length > 0);

    if (assignCard && !cardAccount) {
        const supportDetails = await getSupportDetails(ctx, {
            logical_id: cardId,
            physical_id: physicalId
        });

        if (supportDetails) {
            meansOfLogin.push({
                type: 'cardId',
                physical_id: supportDetails.physical_id,
                data: supportDetails.logical_id,
                blocked: false
            });
        } else if (assignCard) {
            throw new APIError(module, 404, 'Physical support not found');
        }
    }

    // check the mail if needed
    if (checkMail) {
        const mols = await ctx.models.MeanOfLogin.where({
            blocked: false,
            type: 'mail',
            data: targetUser.mail
        })
            .fetchAll({ withRelated: ['user'] })
            .then(mols => mols.toJSON());

        if (mols.length > 0) {
            throw new APIError(module, 403, 'User mail exists', { mail });
        }
    }

    return {
        groupsToAdd,
        targetUser,
        reloads,
        meansOfLogin
    };
};
