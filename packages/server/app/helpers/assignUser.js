const checkAnonymousAccount = require('server/app/helpers/checkAnonymousAccount');
const checkTicket = require('server/app/helpers/checkTicket');
const generateToken = require('server/app/utils/generateToken');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, userId, reloads = [], meansOfLogin = [], groups = [], clientTime) => {
    const mergedCreditIsAlreadyOnCard = ctx.point.name !== 'Internet' || !ctx.event.useCardData;

    const user = await ctx.models.User.where({ id: userId }).fetch({
        withRelated: ['meansOfLogin', 'memberships']
    });

    if (!user) {
        throw new APIError(module, 404, 'User not found', { id: userId });
    }

    await checkTicket(ctx, meansOfLogin);

    const userAccount = user.toJSON();
    const anonymousData = await checkAnonymousAccount(ctx.models, meansOfLogin);
    const totalReloadsCredit = reloads.reduce((a, b) => a + b.credit, 0);
    let mergedAccount = userAccount;
    let molsToSkip = [];
    let groupsToSkip = userAccount.memberships
        .filter(membership => membership.period === ctx.event.defaultPeriod_id)
        .map(membership => membership.group_id);
    let creditToAdd = totalReloadsCredit;

    // if the card already has an anonymous account, keep it, add user informations to it and delete the old one
    if (anonymousData && anonymousData.id !== user.id) {
        const newCredit = mergedCreditIsAlreadyOnCard
            ? userAccount.credit + anonymousData.credit
            : anonymousData.credit;

        const updatedUser = {
            firstname: userAccount.firstname,
            lastname: userAccount.lastname,
            nickname: userAccount.nickname,
            mail: userAccount.mail,
            credit: newCredit,
            pin: userAccount.pin,
            password: userAccount.password,
            recoverKey: userAccount.recoverKey
        };

        if (userAccount.credit) {
            creditToAdd += userAccount.credit;
        }

        const operations = [];

        operations.push(
            new ctx.models.User({ id: anonymousData.id }).save(updatedUser, { patch: true })
        );

        const changes = [
            { model: 'PendingCardUpdate', field: 'user_id' },
            { model: 'Reload', field: 'buyer_id' },
            { model: 'Transfer', field: 'sender_id' },
            { model: 'Transfer', field: 'reciever_id' },
            { model: 'Withdrawal', field: 'buyer_id' },
            { model: 'Refund', field: 'buyer_id' },
            { model: 'Transaction', field: 'user_id' },
            { model: 'Membership', field: 'user_id' },
            { model: 'Right', field: 'user_id' }
        ];

        changes.forEach(change => {
            const whereClause = {
                [change.field]: userAccount.id
            };
            const saveClause = {
                [change.field]: anonymousData.id
            };

            operations.push(
                ctx.models[change.model].where(whereClause).save(saveClause, {
                    patch: true,
                    require: false
                })
            );
        });

        // remove all anonymousAccount mols, except the card
        operations.push(
            ctx.models.MeanOfLogin.where('type', '<>', 'cardId')
                .where({ user_id: anonymousData.id })
                .destroy()
        );

        await Promise.all(operations);

        // transfer mols to the merged account
        await ctx.models.MeanOfLogin.where({ user_id: userAccount.id }).save(
            { user_id: anonymousData.id },
            { patch: true, require: false }
        );

        mergedAccount = anonymousData;
        molsToSkip = userAccount.meansOfLogin.map(mol => mol.type);
        molsToSkip.push('cardId');
        groupsToSkip = groupsToSkip.concat(
            anonymousData.memberships
                .filter(membership => membership.period === ctx.event.defaultPeriod_id)
                .map(membership => membership.group_id)
        );

        // generate the new token, to update manager session
        mergedAccount.token = generateToken({
            id: anonymousData.id,
            point: ctx.point.id,
            connectType: 'pin'
        });
    }

    // add a PCU for reloads and the potential credit of the deleted account
    if (!mergedCreditIsAlreadyOnCard && creditToAdd > 0) {
        await new ctx.models.PendingCardUpdate({
            user_id: mergedAccount.id,
            amount: creditToAdd
        }).save();
    }

    // block old cards if a new one is assigned
    const newCard = meansOfLogin.find(mol => mol.type === 'cardId');

    if (newCard) {
        await ctx.models.MeanOfLogin.where({ user_id: mergedAccount.id, type: 'cardId' })
            // If it's a merge, keep the anonymous account card
            .where('data', '<>', newCard.data)
            .save(
                { blocked: true },
                {
                    patch: true,
                    require: false
                }
            );
    }

    // create requested mols
    await Promise.all(
        meansOfLogin
            .filter(mol => molsToSkip.indexOf(mol.type) === -1)
            .map(mol =>
                new ctx.models.MeanOfLogin({
                    type: mol.type,
                    data: mol.data,
                    blocked: mol.blocked,
                    physical_id: mol.physical_id,
                    user_id: mergedAccount.id,
                    clientTime
                }).save()
            )
    );

    await Promise.all(
        reloads.map(reload =>
            new ctx.models.Reload({
                credit: reload.credit,
                type: reload.type,
                trace: reload.trace,
                point_id: ctx.point.id,
                buyer_id: mergedAccount.id,
                seller_id: (ctx.user || mergedAccount).id,
                clientTime
            }).save()
        )
    );

    await Promise.all(
        groups
            .filter(group => groupsToSkip.indexOf(group) === -1)
            .map(group =>
                new ctx.models.Membership({
                    user_id: mergedAccount.id,
                    group_id: group,
                    period_id: ctx.event.defaultPeriod_id
                }).save()
            )
    );

    // needed to send new meansOfLogin to manager
    const mergedUser = await ctx.models.User.where({ id: mergedAccount.id }).fetch({
        withRelated: ['meansOfLogin']
    });

    return mergedUser.toJSON();
};
