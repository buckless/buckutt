import { reshapeTicket } from '../ticket/reshapers';
import { reshapeWallet } from '../wallet/reshapers';

export const reshapeReloads = ({ start, end }) => {
    const reshapedStart = start ? new Date(start).getTime() : 0;
    const reshapedEnd = end ? new Date(end).getTime() : Infinity;
    const now = Date.now();

    return now >= reshapedStart && now <= reshapedEnd;
};

export const reshapeInfos = ({ giftReloads, paymentCosts, meansOfPayment, reloads, wallets }) => ({
    giftReloads,
    paymentCosts,
    meansOfPayment: meansOfPayment.reduce(
        (acc, meanOfPayment) => ({
            ...acc,
            [meanOfPayment.slug]: meanOfPayment.name
        }),
        {}
    ),
    reloadAllowed: reshapeReloads(reloads),
    wallets: wallets.reduce(
        (acc, wallet) => ({
            ...acc,
            [wallet.id]: reshapeWallet(wallet)
        }),
        {}
    ),
    tickets: wallets.reduce(
        (acc, wallet) => ({
            ...acc,
            [wallet.id]: wallet.ticket ? reshapeTicket(wallet.ticket) : null
        }),
        {}
    )
});
