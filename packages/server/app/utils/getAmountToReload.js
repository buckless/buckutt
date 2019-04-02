module.exports = (event, fullAmount) =>
    (fullAmount - event.fixedCostsReload) / (1 + (event.variableCostsReload / 100));
