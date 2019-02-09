export default users => {
    return Promise.all(
        users.map(user => {
            return {
                credit: user.credit,
                name: user.name,
                username: user.username,
                id: user.userId,
                molId: user.id,
                ticketId: user.barcode,
                physicalId: user.physicalId,
                currentGroups: []
            };
        })
    ).then(users => ({ data: users }));
};

export const formatMemberships = async userId => {
    const now = new Date();

    const memberships = await window.database.userMemberships(userId);

    return memberships
        .filter(membership => new Date(membership.start) <= now && new Date(membership.end) >= now)
        .map(membership => ({ id: membership.group }));
};
