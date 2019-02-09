export function isUserInGroup(user, group, period) {
    return (user.memberships || []).find(
        m => (m.group || {}).id === group.id && (m.period || {}).id === period.id
    );
}
