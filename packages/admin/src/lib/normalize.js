import { normalize, schema } from 'normalizr';

const group = new schema.Entity('groups');
const period = new schema.Entity('periods');
const fundation = new schema.Entity('fundations');
const device = new schema.Entity('devices');
const access = new schema.Entity('accesses');
const meanofpayment = new schema.Entity('meansofpayment');
const alert = new schema.Entity('alerts');
const giftreload = new schema.Entity('giftreloads');
const webservice = new schema.Entity('webservices');
const purchase = new schema.Entity('purchases');
const withdrawal = new schema.Entity('withdrawals');
const reload = new schema.Entity('reloads');
const refund = new schema.Entity('refunds');

const event = new schema.Entity('events', {
    defaultGroup: group,
    defaultFundation: fundation,
    defaultPeriod: period
});

const membership = new schema.Entity('memberships', {
    period,
    group
});

const wiket = new schema.Entity('wikets', {
    device,
    period,
    defaultGroup: group,
    accesses: [access]
});

const price = new schema.Entity('prices', {
    fundation,
    group,
    period
});

const article = new schema.Entity('articles', {
    prices: [price]
});

const category = new schema.Entity('categories', {
    articles: [article]
});

const point = new schema.Entity('points', {
    categories: [category],
    defaultGroup: group,
    wikets: [wiket]
});

const set = new schema.Entity('sets', {
    articles: [article]
});

const promotion = new schema.Entity('promotions', {
    sets: [set],
    prices: [price]
});

const right = new schema.Entity('rights', {
    period,
    point
});

const wallet = new schema.Entity('wallets', {
    memberships: [membership]
});

const user = new schema.Entity('users', {
    wallets: [wallet],
    memberships: [membership],
    rights: [right]
});

const coupon = new schema.Entity('coupons', {
    couponSet: set
});

wallet.define({ user });
price.define({ point });
device.define({ wikets: [wiket] });

export const models = {
    groups: group,
    periods: period,
    fundations: fundation,
    devices: device,
    accesses: access,
    meansofpayment: meanofpayment,
    alerts: alert,
    events: event,
    purchases: purchase,
    withdrawals: withdrawal,
    reloads: reload,
    refunds: refund,
    giftreloads: giftreload,
    webservices: webservice,
    memberships: membership,
    wikets: wiket,
    prices: price,
    articles: article,
    categories: category,
    points: point,
    sets: set,
    promotions: promotion,
    rights: right,
    wallets: wallet,
    users: user,
    coupons: coupon
};

export default (data, route) => normalize(data, models[route]);
