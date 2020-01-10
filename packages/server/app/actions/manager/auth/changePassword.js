const bcrypt = require('bcryptjs');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, { currentPassword, password, currentPin, pin }) => {
    const user = await ctx.models.User.where({ id: ctx.user.id }).fetch();

    const matchPwd = currentPassword
        ? await bcrypt.compare(currentPassword.toString(), ctx.user.password)
        : true;
    const matchPin = currentPin ? await bcrypt.compare(currentPin.toString(), ctx.user.pin) : true;

    if (!matchPwd) {
        throw new APIError(module, 401, 'Current password is wrong');
    }

    if (!matchPin) {
        throw new APIError(module, 401, 'Current PIN is wrong');
    }

    if (currentPassword && password) {
        const hashPwd = await bcrypt.hash(password, 10);

        user.set('password', hashPwd);
    }

    if (currentPin && pin) {
        const hashPin = await bcrypt.hash(pin, 10);

        user.set('pin', hashPin);
    }

    await user.save();
};
