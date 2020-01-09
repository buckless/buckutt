export const reshapeReload = data => ({
    outcome: 'success',
    type: data.type,
    data: {
        nextUrl: data.res
    }
});

export const reshapeAmount = (amount, paymentCosts) =>
    Math.round(
        amount * (1 + paymentCosts.variableCostsReload / 100) + paymentCosts.fixedCostsReload
    );
