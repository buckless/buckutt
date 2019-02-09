const bcrypt = require('bcryptjs');

const generatepin = async (ctx, { pin, recoverKey }) => {
    const user = await ctx.models.User.where({ recoverKey }).fetch({ require: true });

    const hash = await bcrypt.hash(pin, 10);
    user.set('pin', hash);
    user.set('recoverKey', '');
    user.set('updated_at', new Date());

    await user.save();
};

module.exports = {
    generatepin
};
