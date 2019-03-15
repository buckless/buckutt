const randomstring = require('randomstring');
const config = require('server/app/config');
const mailer = require('server/app/mailer');
const { knex } = require('server/app/db').bookshelf;

const askpin = async (ctx, { mail }) => {
    const user = await ctx.models.User.query(q =>
        q.where(knex.raw('lower(mail)'), '=', mail.toLowerCase().trim())
    ).fetch({ require: true });

    user.set('recoverKey', randomstring.generate());

    await user.save();
    await mailer.send({
        name: 'pinLink',
        data: {
            brandname: config.merchantName,
            link: `${config.urls.managerUrl}/forgot?key=${user.get('recoverKey')}`
        },
        from: config.askpin.from,
        to: user.get('mail'),
        subject: `${config.merchantName} — ${config.askpin.subject}`
    });

    return user.toJSON();
};

module.exports = {
    askpin
};
