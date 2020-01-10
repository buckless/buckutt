module.exports = ctx =>
    ctx.models.Device.where({ fingerprint: 'web' })
        .count()
        .then(c => c === '1')
        .catch(() => false);
