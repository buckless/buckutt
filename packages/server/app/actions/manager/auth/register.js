const { omit } = require('lodash');
const assignParser = require('server/app/helpers/assignParser');
const createUser = require('server/app/helpers/createUser');
const APIError = require('server/app/utils/APIError');

const register = async (
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
    const registerData = await assignParser(
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

    if (registerData.targetUser.id) {
        return Promise.reject(new APIError(module, 400, 'This user already exists'));
    }

    const user = await createUser(
        ctx,
        registerData.targetUser,
        registerData.reloads,
        registerData.meansOfLogin,
        registerData.groupsToAdd,
        true,
        // if Internet (manager), create PCU, else (assigner) directly write
        ctx.point.name !== 'Internet',
        clientTime
    );

    return omit(user, 'pin', 'password');
};

module.exports = {
    register
};
