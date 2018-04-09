import sortOrder from '../../lib/sortOrder';

export const staff = state => {
    const now = new Date();
    const event = state.app.currentEvent;
    const staffList = [];

    state.objects.rights
        .filter(right => right.period.event_id === event.id && new Date(right.period.end) >= now)
        .forEach(right => {
            const user = right.user;

            let userIndex = staffList.findIndex(u => user.id === u.id);

            if (userIndex === -1) {
                const newUser = user;
                newUser.rights = [];
                userIndex = staffList.push(newUser) - 1;
            }

            let userPoint = right.point;

            if (!userPoint) {
                userPoint = { name: 'Aucun' };
            }

            staffList[userIndex].rights.push({
                name: right.name,
                period: right.period,
                point: userPoint
            });

            staffList[userIndex].rights = staffList[userIndex].rights.sort((a, b) =>
                sortOrder(a.name, b.name)
            );
        });

    return staffList.sort((a, b) => sortOrder(a.firstname, b.firstname));
};
