const { bookshelf } = require('server/app/db');

module.exports = async (ctx, { cardId, wiketId, clientTime }) => {
    const mol = await ctx.models.MeanOfLogin.query(q =>
        q.where(bookshelf.knex.raw('lower(data)'), '=', cardId)
    )
        .where({ type: 'cardId', blocked: false })
        .fetch({ require: true })
        .then(mol => (mol ? mol.toJSON() : null));

    const access = new ctx.models.Access({
        meanOfLogin_id: mol.id,
        operator_id: ctx.user.id,
        wiket_id: wiketId,
        clientTime: clientTime
    });

    await access.save();
};
