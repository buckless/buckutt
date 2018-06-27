const checkAnonymousAccount = require('./checkAnonymousAccount');
const checkTicket = require('./checkTicket');
const generateToken = require('./generateToken');
const log = require('./log')(module);
const APIError = require('../errors/APIError');

module.exports = async function assignUser(
    models,
    event,
    operator = {},
    point,
    userId,
    reloads = [],
    meansOfLogin = [],
    groups = [],
    isWritten
) {
    const user = await models.User.where({ id: userId }).fetch({
        withRelated: ['meansOfLogin', 'memberships']
    });

    if (!user) {
        return Promise.reject(new APIError(module, 404, 'User not found', { body: req.body }));
    }

    await checkTicket(models, meansOfLogin);

    const userAccount = user.toJSON();
    const anonymousData = await checkAnonymousAccount(models, meansOfLogin);
    const totalReloadsCredit = reloads.reduce((a, b) => a + b.credit, 0);
    let mergedAccount = userAccount;
    let molsToSkip = [];
    let groupsToSkip = userAccount.memberships
        .filter(membership => membership.period === event.defaultPeriod_id)
        .map(membership => membership.group_id);
    let creditToAdd = totalReloadsCredit;

    // If the card already has an anonymous account, keep it, add user informations to it and delete the old one
    if (anonymousData && anonymousData.id !== user.id) {
        const newCredit = isWritten
            ? userAccount.credit + anonymousData.credit
            : anonymousData.credit;

        const updatedUser = {
            firstname: userAccount.firstname,
            lastname: userAccount.lastname,
            nickname: userAccount.nickname,
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
            new models.User({ id: anonymousData.id }).save(updatedUser, { patch: true })
        );

        const changes = [
            {
                model: 'PendingCardUpdate',
                field: 'user_id'
            },
            {
                model: 'Reload',
                field: 'buyer_id'
            },
            {
                model: 'Transfer',
                field: 'sender_id'
            },
            {
                model: 'Transfer',
                field: 'reciever_id'
            },
            {
                model: 'Purchase',
                field: 'buyer_id'
            },
            {
                model: 'Withdrawal',
                field: 'buyer_id'
            },
            {
                model: 'Refund',
                field: 'buyer_id'
            },
            {
                model: 'Transaction',
                field: 'user_id'
            },
            {
                model: 'Membership',
                field: 'user_id'
            },
            {
                model: 'Right',
                field: 'user_id'
            }
        ];

        changes.forEach(change => {
            const whereClause = {
                [change.field]: userAccount.id
            };
            const saveClause = {
                [change.field]: anonymousData.id
            };

            operations.push(
                models[change.model].where(whereClause).save(saveClause, {
                    patch: true,
                    require: false
                })
            );
        });

        // Remove all anonymousAccount mols, except the card
        operations.push(
            models.MeanOfLogin.where('type', '<>', 'cardId')
                .where({ user_id: anonymousData.id })
                .destroy()
        );

        await Promise.all(operations);

        // Transfer mols to the merged account
        await models.MeanOfLogin.where({ user_id: userAccount.id }).save(
            { user_id: anonymousData.id },
            {
                patch: true,
                require: false
            }
        );

        mergedAccount = anonymousData;
        molsToSkip = userAccount.meansOfLogin.map(mol => mol.type);
        molsToSkip.push('cardId');
        groupsToSkip = groupsToSkip.concat(
            anonymousAccount.memberships
                .filter(membership => membership.period === event.defaultPeriod_id)
                .map(membership => membership.group_id)
        );

        // Generate the new token, to update manager session
        mergedAccount.token = generateToken({
            id: anonymousData.id,
            point: point.id,
            connectType: 'pin'
        });
    }

    // Add a PCU for reloads and the potential credit of the deleted account
    if (!isWritten && creditToAdd > 0) {
        await new models.PendingCardUpdate({
            user_id: mergedAccount.id,
            amount: creditToAdd
        }).save();
    }

    // Block old cards if a new one is assigned
    if (meansOfLogin.some(mol => mol.type === 'cardId')) {
        await models.MeanOfLogin.where({ user_id: mergedAccount.id, type: 'cardId' }).save(
            { blocked: true },
            {
                patch: true,
                require: false
            }
        );
    }

    // Create requested mols
    await Promise.all(
        meansOfLogin.filter(mol => molsToSkip.indexOf(mol.type) === -1).map(mol =>
            new models.MeanOfLogin({
                type: mol.type,
                data: mol.data,
                blocked: mol.blocked,
                physical_id: mol.physical_id,
                user_id: mergedAccount.id
            }).save()
        )
    );

    await Promise.all(
        reloads.map(reload =>
            new models.Reload({
                credit: reload.credit,
                type: reload.type,
                trace: reload.trace,
                point_id: point.id,
                buyer_id: mergedAccount.id,
                seller_id: operator.id || mergedAccount.id
            }).save()
        )
    );

    await Promise.all(
        groups.filter(group => groupsToSkip.indexOf(group) === -1).map(group =>
            new models.Membership({
                user_id: mergedAccount.id,
                group_id: group,
                period_id: event.defaultPeriod_id
            }).save()
        )
    );

    // Needed to send new meansOfLogin to manager
    const mergedUser = await models.User.where({ id: mergedAccount.id }).fetch({
        withRelated: ['meansOfLogin']
    });

    return mergedUser.toJSON();
};
