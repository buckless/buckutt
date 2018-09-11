export default users => {
    const now = new Date();

    return Promise.all(
        users.map(user =>
            window.database.userMemberships(user.id).then(memberships => {
                const currentGroups = memberships
                    .filter(
                        membership =>
                            new Date(membership.start) <= now && new Date(membership.end) >= now
                    )
                    .map(membership => ({ id: membership.group }));

                return {
                    credit: user.credit,
                    name: user.name,
                    username: user.username,
                    id: user.userId,
                    currentGroups
                };
            })
        )
    ).then(users => ({ data: users }));
};
