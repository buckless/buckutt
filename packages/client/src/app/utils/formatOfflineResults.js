export const formatMemberships = async walletId => {
    const now = new Date();

    const memberships = await window.database.walletMemberships(walletId);

    return memberships
        .filter(membership => new Date(membership.start) <= now && new Date(membership.end) >= now)
        .map(membership => ({ id: membership.groupId }));
};
