import i18n from '@/i18n';

export const change = async (ctx, { currentPin, pin, confirmation }) => {
    let message = null;

    if (pin !== confirmation) {
        message = i18n.t('dashboard.pin.same');
    }

    if (currentPin === pin) {
        message = i18n.t('dashboard.pin.notnew');
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
            { message: i18n.t('dashboard.pin.oldwrong') },
            { root: true }
        );
        await ctx.dispatch('working/set', false, { root: true });

        return false;
    }

    await ctx.dispatch(
        'notifications/send',
        { message: i18n.t('dashboard.pin.success') },
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
            { message: i18n.t('forgot.wrongmail') },
            { root: true }
        );
        await ctx.dispatch('working/set', false, { root: true });

        return false;
    }

    await ctx.dispatch('notifications/send', { message: i18n.t('forgot.sent') }, { root: true });

    await ctx.dispatch('working/set', false, { root: true });

    return true;
};

export const reset = async (ctx, { key, pin, confirmation }) => {
    if (pin !== confirmation) {
        await ctx.dispatch(
            'notifications/send',
            { message: i18n.t('dashboard.pin.same') },
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
            { message: i18n.t('forgot.fail') },
            { root: true }
        );

        return false;
    }

    await ctx.dispatch(
        'notifications/send',
        { message: i18n.t('dashboard.pin.success') },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });

    return true;
};
