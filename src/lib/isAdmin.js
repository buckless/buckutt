export function isAdmin(user) {
    let admin = false;
    if (user) {
        user.rights.forEach(right => {
            if (
                right.name === 'admin' &&
                new Date(right.period.start).getTime() <= Date.now() &&
                new Date(right.period.end).getTime() >= Date.now()
            ) {
                admin = true;
            }
        });
    }

    return admin;
}
