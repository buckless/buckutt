const bcrypt = require('bcryptjs');

module.exports = async (ctx, { password, recoverKey }) => {
    const user = await ctx.models.User.where({ recoverKey }).fetch({ require: true });

    const hash = await bcrypt.hash(password, 10);
    user.set('password', hash);
    user.set('recoverKey', '');
    user.set('updated_at', new Date());

    await user.save();
};
