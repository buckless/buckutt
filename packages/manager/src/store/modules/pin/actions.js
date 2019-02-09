export const change = async (ctx, { currentPin, pin, confirmation }) => {
    let message = null;

    if (pin !== confirmation) {
        message = 'Les deux codes PIN ne sont pas identiques';
    }

    if (currentPin === pin) {
        message = "L'ancien et le nouveau code PIN rentrés sont identiques";
    }

    if (message) {
        await ctx.dispatch('notifications/send', { message }, { root: true });
        return false;
    }

    await ctx.dispatch('working/set', true, { root: true });

    const body = { currentPin, pin };

    const result = await ctx.dispatch(
        'request/put',
        { url: 'auth/changepin', body, notFoundHandled: true },
        { root: true }
    );

    if (!result || !result.changed) {
        await ctx.dispatch(
            'notifications/send',
            { message: "L'ancien code PIN est faux" },
            { root: true }
        );
        await ctx.dispatch('working/set', false, { root: true });

        return false;
    }

    await ctx.dispatch(
        'notifications/send',
        { message: 'Le code PIN a bien été changé' },
        { root: true }
    );

    await ctx.dispatch('working/set', true, { root: true });

    return true;
};

export const sendReset = async (ctx, mail) => {
    await ctx.dispatch('working/set', true, { root: true });

    const result = await ctx.dispatch(
        'request/get',
        { url: `auth/askpin?mail=${mail}`, notFoundHandled: true },
        { root: true }
    );

    if (!result || !result.success) {
        await ctx.dispatch(
            'notifications/send',
            { message: 'Cette adresse mail est inconnue' },
            { root: true }
        );
        await ctx.dispatch('working/set', false, { root: true });

        return false;
    }

    await ctx.dispatch('notifications/send', { message: 'Lien envoyé' }, { root: true });

    await ctx.dispatch('working/set', false, { root: true });

    return true;
};

export const reset = async (ctx, { key, pin, confirmation }) => {
    if (pin !== confirmation) {
        await ctx.dispatch(
            'notifications/send',
            { message: 'Les deux codes PIN ne sont pas identiques' },
            { root: true }
        );

        return false;
    }

    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        key,
        pin
    };

    const result = await ctx.dispatch(
        'request/put',
        { url: 'auth/generatepin', body },
        { root: true }
    );

    if (!result || !result.success) {
        await ctx.dispatch('working/set', false, { root: true });
        await ctx.dispatch(
            'notifications/send',
            { message: 'Impossible de changer le code PIN' },
            { root: true }
        );

        return false;
    }

    await ctx.dispatch(
        'notifications/send',
        { message: 'Le code PIN a bien été changé' },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });

    return true;
};
