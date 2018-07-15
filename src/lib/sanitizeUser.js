const rightsDetails = require('./rightsDetails');

module.exports = (user, point) => {
    user.pin = '';
    user.password = '';

    const userRights = rightsDetails(user, point);

    user.canSell = userRights.sell;
    user.canReload = userRights.reload;
    user.canAssign = userRights.assign;
    user.canControl = userRights.control;

    return user;
};
