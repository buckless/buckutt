const bcrypt = require('bcryptjs');
const APIError = require('server/app/utils/APIError');

const changePin = async (ctx, { currentPin, pin }) => {
    if (currentPin.length !== 4 && pin.length !== 4) {
        throw new APIError(module, 401, 'PINs has to be clear, not crypted');
    }

    const match = await bcrypt.compare(currentPin.toString(), ctx.user.pin);

    if (!match) {
        throw new APIError(module, 401, 'PIN is wrong');
    }

    const hash = await bcrypt.hash(pin, 10);
    const user = await ctx.models.User.where({ id: ctx.user.id }).fetch();

    user.set('pin', hash);
    user.set('updated_at', new Date());

    await user.save();
};

module.exports = {
    changePin
};
