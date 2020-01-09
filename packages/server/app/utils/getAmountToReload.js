module.exports = (event, fullAmount) =>
    Math.round((fullAmount - event.fixedCostsReload) / (1 + event.variableCostsReload / 100));
