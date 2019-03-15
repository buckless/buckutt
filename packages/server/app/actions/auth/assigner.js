const { assignCard } = require('server/app/actions/manager/auth/assignCard');
const { assignWallet } = require('server/app/actions/manager/auth/assignWallet');
const fetchTicket = require('server/app/helpers/fetchTicket');
const assignGroups = require('server/app/helpers/assignGroups');
const APIError = require('server/app/utils/APIError');

const assigner = async (
    ctx,
    { logicalId, ticketNumber, walletId, groups, writtenCredit, clientTime }
) => {
    let wallet;
    // Case 1: a ticket number is provided
    if (ticketNumber) {
        const ticket = await fetchTicket(ctx, ticketNumber);

        // If the ticket has a wallet assignated to it: the ticketNumber has been provided by error
        if (ticket.wallet) {
            // If the wallet is already assigned to a card, reject
            if (ticket.wallet.logical_id) {
                return Promise.reject(
                    new APIError(module, 400, 'This ticket already belongs to a card')
                );
            }

            // If the wallet doesn't have any card assignated, continue
            wallet = await assignWallet(ctx, {
                walletId: ticket.wallet.id,
                logicalId,
                clientTime
            });

            // Create a PCU of the reversed amount of the already written credit
            if (writtenCredit > 0) {
                await new ctx.models.PendingCardUpdate({
                    amount: -1 * writtenCredit,
                    wallet_id: wallet.id
                }).save();
            }
            // In the other hand, create a wallet
        } else {
            wallet = await assignCard(ctx, {
                logicalId,
                ticketNumber,
                clientTime
            });
        }
        // Case 2: a wallet id is provided
    } else if (walletId) {
        wallet = await assignWallet(ctx, {
            walletId,
            logicalId,
            clientTime
        });

        // Create a PCU of the reversed amount of the already written credit
        if (writtenCredit > 0) {
            await new ctx.models.PendingCardUpdate({
                amount: -1 * writtenCredit,
                wallet_id: wallet.id
            }).save();
        }
        // Case 3: a card id only is provided
    } else {
        wallet = await assignCard(ctx, {
            logicalId,
            clientTime
        });
    }

    await assignGroups(ctx, { groups, wallet });

    return wallet;
};

module.exports = {
    assigner
};
