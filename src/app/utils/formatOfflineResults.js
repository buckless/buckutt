export default users => {
    // const now = new Date();

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
        // fix me : put back and remove O(n2)
        //     window.database.userMemberships(user.id).then(memberships => {
        //         // const currentGroups = memberships
        //         //     .filter(
        //         //         membership =>
        //         //             new Date(membership.start) <= now && new Date(membership.end) >= now
        //         //     )
        //         //     .map(membership => ({ id: membership.group }));

        //     })
        // )
    ).then(users => ({ data: users }));
};
