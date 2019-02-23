const { omit } = require('lodash');
const assignParser = require('server/app/helpers/assignParser');
const assignUser = require('server/app/helpers/assignUser');
const createUser = require('server/app/helpers/createUser');

const assigner = async (
    ctx,
    {
        ticketNumber,
        cardId,
        firstname,
        lastname,
        mail,
        userId,
        anon,
        credit,
        groups,
        physicalId,
        clientTime
    }
) => {
    const assignData = await assignParser(
        ctx,
        ticketNumber,
        cardId,
        firstname,
        lastname,
        mail,
        userId,
        anon,
        credit,
        groups,
        physicalId
    );

    let user;

    if (assignData.targetUser.id) {
        user = await assignUser(
            ctx,
            assignData.targetUser.id,
            assignData.reloads,
            assignData.meansOfLogin,
            assignData.groupsToAdd,
            clientTime
        );
    }

    user = await createUser(
        ctx,
        assignData.targetUser,
        assignData.reloads,
        assignData.meansOfLogin,
        assignData.groupsToAdd,
        // only send a mail if the address is given
        !!assignData.targetUser.mail,
        // if Internet (manager), create PCU, else (assigner) directly write
        ctx.point.name !== 'Internet',
        clientTime
    );

    ctx.pub.publish(
        'userCreditUpdate',
        JSON.stringify({
            id: user.id,
            credit: null,
            pending: null
        })
    );

    return omit(user, 'pin', 'password');
};

module.exports = {
    assigner
};
