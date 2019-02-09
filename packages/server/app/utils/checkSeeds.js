module.exports = ctx =>
    ctx.models.Device.where({ fingerprint: 'admin' })
        .count()
        .then(c => c === '1')
        .catch(() => false);
