const getSupportDetails = require('server/app/helpers/getSupportDetails');
const fetchTicket = require('server/app/helpers/fetchTicket');
const mergeWallets = require('server/app/helpers/mergeWallets');
const assignCardToWallet = require('server/app/helpers/assignCardToWallet');
const assignTicket = require('server/app/helpers/assignTicket');
const APIError = require('server/app/utils/APIError');

// Used to assign a user-linked wallet to a card or a ticket, or both
module.exports = async (ctx, { physicalId, logicalId, ticketNumber, walletId, clientTime }) => {
    if (!walletId) {
        return Promise.reject(new APIError(module, 400, 'The wallet id is missing'));
    }

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
    let realPhysicalId;
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

        realPhysicalId = supportDetails.physical_id;
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

    let wallet = await ctx.models.Wallet.where({ id: walletId })
        .fetch({ withRelated: ['ticket'] })
        .then(cardWallet => (cardWallet ? cardWallet.toJSON() : null));

    if (!wallet) {
        return Promise.reject(new APIError(module, 400, 'Wallet not found'));
    }

    // If a ticket is provided, and the provided wallet already has a ticket, reject
    if (wallet.ticket && ticket) {
        return Promise.reject(new APIError(module, 400, 'This wallet already belongs to a ticket'));
    }

    // If a card is provided, and the provided wallet already as a card, reject
    if (wallet.logical_id && realLogicalId) {
        return Promise.reject(new APIError(module, 400, 'This wallet already belongs to a card'));
    }

    // If a logical id is provided, link the card to the provided wallet
    if (realLogicalId) {
        // If a wallet has been found for this card, merge cardWallet properties inside the provided wallet
        if (cardWallet) {
            await mergeWallets(ctx, { onlineWallet: wallet, cardWallet });
        }

        // Assign the card ids to the provided wallet
        wallet = await assignCardToWallet(ctx, {
            wallet,
            physicalId: realPhysicalId,
            logicalId: realLogicalId
        });
    }

    // If a ticket has been found previously, assign it to the provided wallet
    if (ticket) {
        wallet.ticket = await assignTicket(ctx, { ticket, wallet, clientTime });
    }

    return wallet;
};
