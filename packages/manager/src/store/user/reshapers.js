import { reshapeTicket } from '../ticket/reshapers';
import { reshapeWallet } from '../wallet/reshapers';

export const reshapeUser = user => ({
    id: user.id,
    firstName: user.firstname,
    lastName: user.lastname,
    fullName: `${user.firstname} ${user.lastname}`,
    mail: user.mail
});

export const reshapeLogin = ({ user, token }) => ({
    user: reshapeUser(user),
    token,
    wallets: user.wallets.reduce(
        (acc, wallet) => ({
            ...acc,
            [wallet.id]: reshapeWallet(wallet)
        }),
        {}
    ),
    tickets: user.wallets.reduce(
        (acc, wallet) => ({
            ...acc,
            [wallet.id]: wallet.ticket ? reshapeTicket(wallet.ticket) : null
        }),
        {}
    )
});
