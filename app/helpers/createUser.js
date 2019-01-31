const faker = require('faker/locale/fr');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const { padStart } = require('lodash');
const config = require('@/config');
const log = require('@/log')(module);
const mailer = require('@/mailer');
const checkAnonymousAccount = require('@/helpers/checkAnonymousAccount');
const checkTicket = require('@/helpers/checkTicket');
const username = require('@/helpers/username');
const APIError = require('@/utils/APIError');

module.exports = async (
    ctx,
    mergeUser,
    reloads = [],
    meansOfLogin = [],
    groups = [],
    sendMail = true,
    mergedCreditIsAlreadyOnCard = false,
    clientTime
) => {
    let newUser;
    let pin;
    let creditToAdd = 0;
    const molsToSkip = [];

    pin = mergeUser.pin || padStart(Math.floor(Math.random() * 10000), 4, '0');

    await checkTicket(ctx, meansOfLogin);

    const anonymousData = await checkAnonymousAccount(ctx, meansOfLogin);

    const totalReloadsCredit = reloads.reduce((a, b) => a + b.credit, 0);
    creditToAdd = mergeUser.credit ? mergeUser.credit + totalReloadsCredit : totalReloadsCredit;
    let userCredit = mergedCreditIsAlreadyOnCard ? creditToAdd : 0;

    if (anonymousData) {
        userCredit += anonymousData.credit;
    }

    const userData = {
        firstname: mergeUser.firstname || faker.name.firstName(),
        lastname: mergeUser.lastname || 'Anon',
        nickname: mergeUser.nickname || '',
        mail: mergeUser.mail || 'anon@anon.com',
        pin: mergeUser.cryptedPin || bcrypt.hashSync(pin),
        password: mergeUser.password || 'none',
        recoverKey: randomstring.generate(),
        credit: userCredit,
        isTemporary: false
    };

    if (anonymousData) {
        molsToSkip.push('cardId');
        newUser = new ctx.models.User({ id: anonymousData.id });
        await newUser.save(userData, { patch: true });
    } else {
        // Only set clientTime on user creation
        userData.clientTime = clientTime;
        newUser = new ctx.models.User(userData);
        await newUser.save();
    }

    const userName =
        mergeUser.username || (await username(newUser.get('firstname'), newUser.get('lastname')));

    if (!userName) {
        throw new APIError(module, 500, 'Username can not be generated', { mergeUser });
    }

    // remove old mols instead cardId (to keep clientTime)
    await ctx.models.MeanOfLogin.where('type', 'in', ['mail', 'username'])
        .where({ user_id: newUser.id })
        .destroy();

    // create requested mols
    const molsPromises = meansOfLogin.filter(mol => molsToSkip.indexOf(mol.type) === -1).map(mol =>
        new ctx.models.MeanOfLogin({
            type: mol.type,
            data: mol.data,
            physical_id: mol.physical_id,
            blocked: mol.blocked,
            user_id: newUser.id,
            clientTime
        }).save()
    );

    // create standard mols
    if (mergeUser.mail) {
        molsPromises.push(
            new ctx.models.MeanOfLogin({
                type: 'mail',
                data: newUser.get('mail'),
                blocked: false,
                user_id: newUser.id,
                clientTime
            }).save()
        );
    }

    molsPromises.push(
        new ctx.models.MeanOfLogin({
            type: 'username',
            data: userName,
            blocked: false,
            user_id: newUser.id,
            clientTime
        }).save()
    );

    // create reloads
    const reloadsPromises = reloads.map(reload =>
        new ctx.models.Reload({
            credit: reload.credit,
            type: reload.type || 'anon',
            trace: reload.trace || 'anon',
            point_id: ctx.point.id,
            buyer_id: newUser.id,
            seller_id: (ctx.user || newUser).id,
            clientTime
        }).save()
    );

    // create a reload for the base credit
    if (mergeUser.credit > 0) {
        reloadsPromises.push(
            new ctx.models.Reload({
                credit: mergeUser.credit,
                type: 'assigner',
                trace: 'assigner',
                point_id: ctx.point.id,
                buyer_id: newUser.id,
                seller_id: (ctx.user || newUser).id,
                clientTime
            }).save()
        );
    }

    // add a PCU if the credit isn't written yet
    let pendingCardUpdate = Promise.resolve();
    if (!mergedCreditIsAlreadyOnCard && creditToAdd > 0) {
        pendingCardUpdate = new ctx.models.PendingCardUpdate({
            user_id: newUser.id,
            amount: creditToAdd
        }).save();
    }

    // add requested memberships
    const membershipsPromises = groups.map(group =>
        new ctx.models.Membership({
            user_id: newUser.id,
            group_id: group,
            period_id: ctx.event.defaultPeriod_id
        }).save()
    );

    await Promise.all(
        molsPromises
            .concat(reloadsPromises)
            .concat(membershipsPromises)
            .concat([pendingCardUpdate])
    );

    if (sendMail) {
        await mailer
            .send({
                name: 'pinAssign',
                data: {
                    pin,
                    username: userName,
                    email: newUser.get('mail'),
                    brandname: config.merchantName,
                    link: `${config.urls.managerUrl}`
                },
                from: config.askpin.from,
                to: newUser.get('mail'),
                subject: config.assigner.subject
            })
            .catch(err => {
                const error = new Error('sendMail failed');
                error.stack += `\nCaused by:\n${err.stack}`;

                log.error(error);
            });
    }

    return newUser.toJSON();
};
