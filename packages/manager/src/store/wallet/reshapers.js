export const reshapeWallet = wallet => ({
    id: wallet.id,
    credit: wallet.credit,
    logicalId: wallet.logical_id,
    physicalId: wallet.physical_id,
    blocked: wallet.blocked,
    refunds: wallet.refunds
});
