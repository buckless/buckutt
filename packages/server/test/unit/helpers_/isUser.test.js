const test = require('ava');
const isUser = require('server/app/helpers/isUser');

const oneDay = 1000 * 60 * 60 * 24;

const makeUser = name => ({
    name,
    rights: [
        {
            point_id: 'foo',
            name,
            period: { start: Date.now() - oneDay, end: Date.now() + oneDay }
        }
    ]
});

const admin = makeUser('admin');
const seller = makeUser('seller');
const reloader = makeUser('reloader');
const controller = makeUser('controller');
const assigner = makeUser('assigner');
const sellerReloader = makeUser('seller');

const foo = { id: 'foo' };
const bar = { id: 'bar' };

sellerReloader.name = 'sellerReloader';
sellerReloader.rights.push({
    point_id: 'foo',
    name: 'reloader',
    period: sellerReloader.rights[0].period
});

test('isUser.loggedIn()', t => {
    t.is(false, isUser.loggedIn());
    t.is(false, isUser.loggedIn(null));
    t.is(true, isUser.loggedIn(admin));
});

test('isUser.admin()', t => {
    t.is(true, isUser.admin(admin, foo, Date.now()));
    t.is(false, isUser.admin(admin, bar, Date.now()));
    t.is(false, isUser.admin(admin, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.admin(seller, foo, Date.now()));
});

test('isUser.seller()', t => {
    t.is(true, isUser.seller(seller, foo, Date.now()));
    t.is(false, isUser.seller(seller, bar, Date.now()));
    t.is(false, isUser.seller(seller, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.seller(reloader, foo, Date.now()));

    t.is(true, isUser.seller(sellerReloader, foo, Date.now()));
    t.is(false, isUser.seller(sellerReloader, bar, Date.now()));
    t.is(false, isUser.seller(sellerReloader, foo, Date.now() - oneDay * 2));
});

test('isUser.reloader()', t => {
    t.is(true, isUser.reloader(reloader, foo, Date.now()));
    t.is(false, isUser.reloader(reloader, bar, Date.now()));
    t.is(false, isUser.reloader(reloader, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.reloader(seller, foo, Date.now()));

    t.is(true, isUser.reloader(sellerReloader, foo, Date.now()));
    t.is(false, isUser.reloader(sellerReloader, bar, Date.now()));
    t.is(false, isUser.reloader(sellerReloader, foo, Date.now() - oneDay * 2));
});

test('isUser.assigner()', t => {
    t.is(true, isUser.assigner(assigner, foo, Date.now()));
    t.is(false, isUser.assigner(assigner, bar, Date.now()));
    t.is(false, isUser.assigner(assigner, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.assigner(seller, foo, Date.now()));
});

test('isUser.controller()', t => {
    t.is(true, isUser.controller(controller, foo, Date.now()));
    t.is(false, isUser.controller(controller, bar, Date.now()));
    t.is(false, isUser.controller(controller, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.controller(seller, foo, Date.now()));
});

test('isUser.operator()', t => {
    t.is(true, isUser.operator(seller, foo, Date.now()));
    t.is(false, isUser.operator(seller, bar, Date.now()));
    t.is(false, isUser.operator(seller, foo, Date.now() - oneDay * 2));
    t.is(true, isUser.operator(reloader, foo, Date.now()));
    t.is(false, isUser.operator(reloader, bar, Date.now()));
    t.is(false, isUser.operator(reloader, foo, Date.now() - oneDay * 2));
    t.is(true, isUser.operator(assigner, foo, Date.now()));
    t.is(false, isUser.operator(assigner, bar, Date.now()));
    t.is(false, isUser.operator(assigner, foo, Date.now() - oneDay * 2));
    t.is(true, isUser.operator(controller, foo, Date.now()));
    t.is(false, isUser.operator(controller, bar, Date.now()));
    t.is(false, isUser.operator(controller, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.operator(admin, foo, Date.now()));
});

test('isUser.sellerOrAdmin()', t => {
    t.is(true, isUser.sellerOrAdmin(seller, foo, Date.now()));
    t.is(true, isUser.sellerOrAdmin(admin, foo, Date.now()));
    t.is(false, isUser.sellerOrAdmin(seller, bar, Date.now()));
    t.is(false, isUser.sellerOrAdmin(seller, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.sellerOrAdmin(reloader, foo, Date.now()));
});

test('isUser.reloaderOrAdmin()', t => {
    t.is(true, isUser.reloaderOrAdmin(reloader, foo, Date.now()));
    t.is(true, isUser.reloaderOrAdmin(admin, foo, Date.now()));
    t.is(false, isUser.reloaderOrAdmin(reloader, bar, Date.now()));
    t.is(false, isUser.reloaderOrAdmin(reloader, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.reloaderOrAdmin(seller, foo, Date.now()));
});

test('isUser.assignerOrAdmin()', t => {
    t.is(true, isUser.assignerOrAdmin(assigner, foo, Date.now()));
    t.is(true, isUser.assignerOrAdmin(admin, foo, Date.now()));
    t.is(false, isUser.assignerOrAdmin(assigner, bar, Date.now()));
    t.is(false, isUser.assignerOrAdmin(assigner, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.assignerOrAdmin(seller, foo, Date.now()));
});

test('isUser.controllerOrAdmin()', t => {
    t.is(true, isUser.controllerOrAdmin(controller, foo, Date.now()));
    t.is(true, isUser.controllerOrAdmin(admin, foo, Date.now()));
    t.is(false, isUser.controllerOrAdmin(controller, bar, Date.now()));
    t.is(false, isUser.controllerOrAdmin(controller, foo, Date.now() - oneDay * 2));
    t.is(false, isUser.controllerOrAdmin(seller, foo, Date.now()));
});

test('isUser.operatorOrAdmin()', t => {
    t.is(true, isUser.operatorOrAdmin(seller, foo, Date.now()));
    t.is(true, isUser.operatorOrAdmin(reloader, foo, Date.now()));
    t.is(true, isUser.operatorOrAdmin(assigner, foo, Date.now()));
    t.is(true, isUser.operatorOrAdmin(controller, foo, Date.now()));
    t.is(true, isUser.operatorOrAdmin(admin, foo, Date.now()));
});

test('isUser.loggedIn.orThrow.orThrow()', t => {
    t.throws(() => isUser.loggedIn.orThrow());
    t.throws(() => isUser.loggedIn.orThrow(null));
    t.is(true, isUser.loggedIn.orThrow(admin));
});

test('isUser.admin.orThrow()', t => {
    t.is(true, isUser.admin.orThrow(admin, foo, Date.now()));
    t.throws(() => isUser.admin.orThrow(admin, bar, Date.now()));
    t.throws(() => isUser.admin.orThrow(admin, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.admin.orThrow(seller, foo, Date.now()));
});

test('isUser.seller.orThrow()', t => {
    t.is(true, isUser.seller.orThrow(seller, foo, Date.now()));
    t.throws(() => isUser.seller.orThrow(seller, bar, Date.now()));
    t.throws(() => isUser.seller.orThrow(seller, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.seller.orThrow(reloader, foo, Date.now()));

    t.is(true, isUser.seller.orThrow(sellerReloader, foo, Date.now()));
    t.throws(() => isUser.seller.orThrow(sellerReloader, bar, Date.now()));
    t.throws(() => isUser.seller.orThrow(sellerReloader, foo, Date.now() - oneDay * 2));
});

test('isUser.reloader.orThrow()', t => {
    t.is(true, isUser.reloader.orThrow(reloader, foo, Date.now()));
    t.throws(() => isUser.reloader.orThrow(reloader, bar, Date.now()));
    t.throws(() => isUser.reloader.orThrow(reloader, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.reloader.orThrow(seller, foo, Date.now()));

    t.is(true, isUser.reloader.orThrow(sellerReloader, foo, Date.now()));
    t.throws(() => isUser.reloader.orThrow(sellerReloader, bar, Date.now()));
    t.throws(() => isUser.reloader.orThrow(sellerReloader, foo, Date.now() - oneDay * 2));
});

test('isUser.assigner.orThrow()', t => {
    t.is(true, isUser.assigner.orThrow(assigner, foo, Date.now()));
    t.throws(() => isUser.assigner.orThrow(assigner, bar, Date.now()));
    t.throws(() => isUser.assigner.orThrow(assigner, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.assigner.orThrow(seller, foo, Date.now()));
});

test('isUser.controller.orThrow()', t => {
    t.is(true, isUser.controller.orThrow(controller, foo, Date.now()));
    t.throws(() => isUser.controller.orThrow(controller, bar, Date.now()));
    t.throws(() => isUser.controller.orThrow(controller, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.controller.orThrow(seller, foo, Date.now()));
});

test('isUser.operator.orThrow()', t => {
    t.is(true, isUser.operator.orThrow(seller, foo, Date.now()));
    t.throws(() => isUser.operator.orThrow(seller, bar, Date.now()));
    t.throws(() => isUser.operator.orThrow(seller, foo, Date.now() - oneDay * 2));
    t.is(true, isUser.operator.orThrow(reloader, foo, Date.now()));
    t.throws(() => isUser.operator.orThrow(reloader, bar, Date.now()));
    t.throws(() => isUser.operator.orThrow(reloader, foo, Date.now() - oneDay * 2));
    t.is(true, isUser.operator.orThrow(assigner, foo, Date.now()));
    t.throws(() => isUser.operator.orThrow(assigner, bar, Date.now()));
    t.throws(() => isUser.operator.orThrow(assigner, foo, Date.now() - oneDay * 2));
    t.is(true, isUser.operator.orThrow(controller, foo, Date.now()));
    t.throws(() => isUser.operator.orThrow(controller, bar, Date.now()));
    t.throws(() => isUser.operator.orThrow(controller, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.operator.orThrow(admin, foo, Date.now()));
});

test('isUser.sellerOrAdmin.orThrow()', t => {
    t.is(true, isUser.sellerOrAdmin.orThrow(seller, foo, Date.now()));
    t.is(true, isUser.sellerOrAdmin.orThrow(admin, foo, Date.now()));
    t.throws(() => isUser.sellerOrAdmin.orThrow(seller, bar, Date.now()));
    t.throws(() => isUser.sellerOrAdmin.orThrow(seller, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.sellerOrAdmin.orThrow(reloader, foo, Date.now()));
});

test('isUser.reloaderOrAdmin.orThrow()', t => {
    t.is(true, isUser.reloaderOrAdmin.orThrow(reloader, foo, Date.now()));
    t.is(true, isUser.reloaderOrAdmin.orThrow(admin, foo, Date.now()));
    t.throws(() => isUser.reloaderOrAdmin.orThrow(reloader, bar, Date.now()));
    t.throws(() => isUser.reloaderOrAdmin.orThrow(reloader, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.reloaderOrAdmin.orThrow(seller, foo, Date.now()));
});

test('isUser.assignerOrAdmin.orThrow()', t => {
    t.is(true, isUser.assignerOrAdmin.orThrow(assigner, foo, Date.now()));
    t.is(true, isUser.assignerOrAdmin.orThrow(admin, foo, Date.now()));
    t.throws(() => isUser.assignerOrAdmin.orThrow(assigner, bar, Date.now()));
    t.throws(() => isUser.assignerOrAdmin.orThrow(assigner, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.assignerOrAdmin.orThrow(seller, foo, Date.now()));
});

test('isUser.controllerOrAdmin.orThrow()', t => {
    t.is(true, isUser.controllerOrAdmin.orThrow(controller, foo, Date.now()));
    t.is(true, isUser.controllerOrAdmin.orThrow(admin, foo, Date.now()));
    t.throws(() => isUser.controllerOrAdmin.orThrow(controller, bar, Date.now()));
    t.throws(() => isUser.controllerOrAdmin.orThrow(controller, foo, Date.now() - oneDay * 2));
    t.throws(() => isUser.controllerOrAdmin.orThrow(seller, foo, Date.now()));
});

test('isUser.operatorOrAdmin.orThrow()', t => {
    t.is(true, isUser.operatorOrAdmin.orThrow(seller, foo, Date.now()));
    t.is(true, isUser.operatorOrAdmin.orThrow(reloader, foo, Date.now()));
    t.is(true, isUser.operatorOrAdmin.orThrow(assigner, foo, Date.now()));
    t.is(true, isUser.operatorOrAdmin.orThrow(controller, foo, Date.now()));
    t.is(true, isUser.operatorOrAdmin.orThrow(admin, foo, Date.now()));
});
