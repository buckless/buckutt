const getSupportDetails = require('server/app/helpers/getSupportDetails');
const fetchTicket = require('server/app/helpers/fetchTicket');
const createWallet = require('server/app/helpers/createWallet');
const assignWalletToUser = require('server/app/helpers/assignWalletToUser');
const assignCardToWallet = require('server/app/helpers/assignCardToWallet');
const assignTicket = require('server/app/helpers/assignTicket');
const APIError = require('server/app/utils/APIError');

// Used to assign together a card, a ticket and a user in a wallet
const assignCard = async (ctx, { physicalId, logicalId, ticketNumber, userId, clientTime }) => {
    // Check if the provided ticket already belongs to a wallet
    let ticket;
    if (ticketNumber) {
        ticket = await fetchTicket(ctx, ticketNumber);

        if (ticket && ticket.wallet) {
            return Promise.reject(
                new APIError(module, 400, 'This ticket already belongs to a wallet')
            );
        }
    }

    // If a card physical or logical id is provided, check if the card already belongs to a user
    let realLogicalId;
    let cardWallet;
    if (physicalId || logicalId) {
        const supportDetails = await getSupportDetails(ctx, {
            logical_id: logicalId,
            physical_id: physicalId
        });

        if (!supportDetails.logical_id || !supportDetails.physical_id) {
            return Promise.reject(new APIError(module, 404, 'Card not found'));
        }

        realLogicalId = supportDetails.logical_id;

        cardWallet = await ctx.models.Wallet.where({ logical_id: realLogicalId })
            .fetch({ withRelated: ['user', 'ticket'] })
            .then(cardWallet => (cardWallet ? cardWallet.toJSON() : null));

        if (cardWallet && cardWallet.user) {
            return Promise.reject(new APIError(module, 400, 'This card already belongs to a user'));
        }

        // If a ticket is provided, check if the cardWallet aready has a ticket & if it's a different one that the ticket provided
        if (cardWallet && cardWallet.ticket && ticket && cardWallet.ticket.id !== ticket.id) {
            return Promise.reject(
                new APIError(module, 400, 'This card already belongs to a ticket')
            );
        }
    }

    // If a user id has been provided, check if it exists
    let user;
    if (userId) {
        user = await ctx.models.User.where({ id: userId })
            .fetch()
            .then(user => (user ? user.toJSON() : null));
    }

    let wallet;
    // If a wallet has been found, assign provided data to it
    if (cardWallet) {
        wallet = cardWallet;

        if (user) {
            wallet = await assignWalletToUser(ctx, { wallet: cardWallet, user });
        }

        if (realLogicalId) {
            wallet = await assignCardToWallet(ctx, {
                wallet: cardWallet,
                logicalId: realLogicalId
            });
        }
        // Else, create a new wallet with the provided data
    } else {
        wallet = await createWallet(ctx, {
            wallet: cardWallet,
            user,
            logicalId: realLogicalId,
            clientTime
        });
    }

    // If a ticket has been found previously, assign it to the provided wallet
    if (ticket) {
        wallet.ticket = await assignTicket(ctx, { ticket, wallet, clientTime });
    }

    return wallet;
};

module.exports = {
    assignCard
};
