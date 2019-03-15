import bcrypt from 'bcryptjs';

export default (deviceSellers, credentials) => {
    console.log(deviceSellers);
    console.log(credentials);
    const now = new Date();
    const seller = deviceSellers.find(user => user.wallets.indexOf(credentials.wallet) > -1);

    if (!seller || !bcrypt.compareSync(credentials.pin, seller.pin)) {
        return Promise.reject({
            response: { data: { message: 'User not found' } }
        });
    }

    const validRights = seller.rights.filter(
        right => new Date(right.start) <= now && new Date(right.end) >= now
    );

    if (validRights.length === 0) {
        return Promise.reject({
            response: { data: { message: 'Not enough rights' } }
        });
    }

    const canSell = validRights.some(right => right.name === 'seller');
    const canReload = validRights.some(right => right.name === 'reloader');
    const canAssign = validRights.some(right => right.name === 'assigner');
    const canControl = validRights.some(right => right.name === 'controller');

    return Promise.resolve({
        data: {
            user: {
                id: seller.id,
                token: null,
                firstname: seller.firstname,
                lastname: seller.lastname,
                canSell,
                canReload,
                canAssign,
                canControl
            }
        }
    });
};
