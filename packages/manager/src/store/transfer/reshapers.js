export const reshapeUserWallet = userWallet => ({
    id: userWallet.wallet.id,
    label: userWallet.wallet.physical_id
        ? `${userWallet.firstname} ${userWallet.lastname} (${userWallet.wallet.physical_id})`
        : `${userWallet.firstname} ${userWallet.lastname}`,
    section: 'users'
});

export const reshapeUserWallets = data => {
    const wallets = [];

    data.forEach(user => {
        user.wallets.forEach(wallet => {
            wallets.push(reshapeUserWallet({ ...user, wallet }));
        });
    });

    return wallets;
};
