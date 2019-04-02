const { pick } = require('lodash');

module.exports = async ctx => ({
    ...pick(ctx.event, ['fixedCostsReload', 'variableCostsReload', 'fixedCostsRefund', 'variableCostsRefund'])
});
