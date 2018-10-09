export const reload = async (ctx, amount) => {
    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        amount: parseInt(amount * 100, 10)
    };

    const data = await ctx.dispatch(
        'request/post',
        { url: 'payment/reload', body },
        { root: true }
    );

    if (data && data.type === 'url') {
        window.location.href = data.res;
    }

    await ctx.dispatch('working/set', false, { root: true });
};
