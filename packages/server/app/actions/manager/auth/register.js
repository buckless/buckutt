const { omit } = require('lodash');
const getSupportDetails = require('server/app/helpers/getSupportDetails');
const fetchTicket = require('server/app/helpers/fetchTicket');
const createUser = require('server/app/helpers/createUser');
const createWallet = require('server/app/helpers/createWallet');
const assignWalletToUser = require('server/app/helpers/assignWalletToUser');
const assignTicket = require('server/app/helpers/assignTicket');
const APIError = require('server/app/utils/APIError');

const register = async (
    ctx,
    { firstname, lastname, mail, ticketNumber, physicalId, clientTime }
) => {
    // Check if the provided ticket already belongs to a wallet
    let ticket;
    let ticketWallet;
    if (ticketNumber) {
        ticket = await fetchTicket(ctx, ticketNumber);

        // If the wallet linked to the found wallet is already linked to an user, reject
        if (ticket && ticket.wallet && ticket.wallet.user_id) {
            return Promise.reject(
                new APIError(module, 400, 'This ticket already belongs to another wallet')
            );
        }

        ticketWallet = ticket.wallet;
        // If not ticket is provided, check if the needed informations has been provided
    } else if (!firstname || !lastname || !mail) {
        return Promise.reject(new APIError(module, 400, 'Ticket or user informations are needed'));
    }

    const userCheck = await ctx.models.User.where({ mail: mail || ticket.mail })
        .fetch()
        .then(user => (user ? user.toJSON() : null));

    if (userCheck) {
        return Promise.reject(new APIError(module, 400, 'This mail is already taken'));
    }

    // If a card physical id is provided, check if the card already belongs to a user
    let logicalId;
    let cardWallet;
    if (physicalId) {
        const supportDetails = await getSupportDetails(ctx, {
            physical_id: physicalId
        });

        if (!supportDetails.logical_id) {
            return Promise.reject(new APIError(module, 404, 'Card not found'));
        }

        logicalId = supportDetails.logical_id;

        cardWallet = await ctx.models.Wallet.where({ logical_id: logicalId })
            .fetch()
            .then(cardWallet => (cardWallet ? cardWallet.toJSON() : null));

        if (cardWallet && cardWallet.user_id) {
            return Promise.reject(new APIError(module, 400, 'This card already belongs to a user'));
        }
    }

    // If a wallet has been found for both the ticket and the physical id, check if the ticket wallet matches the card wallet
    if (ticketWallet && cardWallet && ticketWallet.id !== cardWallet.id) {
        return Promise.reject(
            new APIError(module, 400, 'This ticket already belongs to another wallet')
        );
    }

    const userToCreate = {
        firstname: firstname || ticket.firstname,
        lastname: lastname || ticket.lastname,
        mail: mail || ticket.mail
    };

    const user = await createUser(ctx, userToCreate, clientTime);
    const foundWallet = ticketWallet || cardWallet;

    // If the provided card or ticket already has a wallet created, link the user to it
    if (foundWallet) {
        user.wallet = await assignWalletToUser(ctx, {
            wallet: foundWallet,
            user,
            clientTime
        });
        // Else, create a new wallet for the user
    } else {
        user.wallet = await createWallet(ctx, {
            logicalId,
            user
        });
    }

    // If a ticket has been found previously, assign it to the created wallet if it isn't done yet
    if (ticket) {
        user.wallet.ticket = await assignTicket(ctx, { ticket, wallet: user.wallet, clientTime });
    }

    return omit(user, 'pin', 'password');
};

module.exports = {
    register
};
