const test = require('ava');
const getAmountToReload = require('server/app/utils/getAmountToReload');

test.only('getAmountToReload()', t => {
    t.is(10, getAmountToReload({ fixedCostsReload: 1, variableCostsReload: 10 }, 12));
});
