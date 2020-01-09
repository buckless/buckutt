const randomstring = require('randomstring');
const config = require('server/app/config');
const mailer = require('server/app/mailer');

module.exports = async (ctx, { mail }) => {
    const user = await ctx.models.User.where('mail', mail.toLowerCase().trim()).fetch({
        require: true
    });

    user.set('recoverKey', randomstring.generate());

    await user.save();
    await mailer.send({
        name: 'passwordLink',
        data: {
            brandname: ctx.event.name,
            link: `${config.urls.managerUrl}/forgot/${user.get('recoverKey')}`
        },
        from: ctx.event.contactMail,
        to: user.get('mail'),
        subject: `${ctx.event.name} — ${config.askpin.subject}`
    });

    return user.toJSON();
};
