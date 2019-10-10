const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, { body }) => {
    await new ctx.models.FailedRequest({
        data: JSON.stringify({
            ...body,
            seller: ctx.user.id
        })
    }).save();
};
