const APIError = require('server/app/utils/APIError');
const rightsDetails = require('server/app/utils/rightsDetails');

const buildIsUser = right => (user, point, date) =>
    Boolean(rightsDetails(user, point, date)[right]);

const buildIsUserOr = (...conditions) => (user, point, date) =>
    conditions.reduce((left, right) => left || right(user, point, date), false);

const fail = () => {
    throw new APIError(module, 401, 'Unauthorized: insufficient rights');
};

const loggedIn = user => Boolean(user);
const admin = buildIsUser('admin');
const seller = buildIsUser('sell');
const reloader = buildIsUser('reload');
const assigner = buildIsUser('assign');
const controller = buildIsUser('control');
const operator = buildIsUser('operator');
const sellerOrAdmin = buildIsUserOr(seller, admin);
const reloaderOrAdmin = buildIsUserOr(reloader, admin);
const assignerOrAdmin = buildIsUserOr(assigner, admin);
const controllerOrAdmin = buildIsUserOr(controller, admin);
const operatorOrAdmin = buildIsUserOr(operator, admin);

loggedIn.orThrow = buildIsUserOr(loggedIn, fail);
admin.orThrow = buildIsUserOr(admin, fail);
seller.orThrow = buildIsUserOr(seller, fail);
reloader.orThrow = buildIsUserOr(reloader, fail);
assigner.orThrow = buildIsUserOr(assigner, fail);
controller.orThrow = buildIsUserOr(controller, fail);
operator.orThrow = buildIsUserOr(operator, fail);
sellerOrAdmin.orThrow = buildIsUserOr(sellerOrAdmin, fail);
reloaderOrAdmin.orThrow = buildIsUserOr(reloaderOrAdmin, fail);
assignerOrAdmin.orThrow = buildIsUserOr(assignerOrAdmin, fail);
controllerOrAdmin.orThrow = buildIsUserOr(controllerOrAdmin, fail);
operatorOrAdmin.orThrow = buildIsUserOr(operatorOrAdmin, fail);

module.exports = {
    loggedIn,
    admin,
    seller,
    reloader,
    assigner,
    controller,
    operator,
    sellerOrAdmin,
    reloaderOrAdmin,
    assignerOrAdmin,
    controllerOrAdmin,
    operatorOrAdmin
};
