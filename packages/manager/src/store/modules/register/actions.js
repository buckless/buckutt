import i18n from '@/i18n';

export const setHasCard = (ctx, card) => {
    ctx.commit('SET_ALREADY_HAS_CARD', card);
};

export const register = async (ctx, { firstname, lastname, mail, ticketNumber, card, cgu }) => {
    if (!cgu) {
        ctx.dispatch(
            'notifications/send',
            { message: i18n.t('register.invalid.conditions') },
            { root: true }
        );
        return false;
    }

    if (ticketNumber) {
        if (typeof ticketNumber !== 'string' || ticketNumber.length === 0) {
            ctx.dispatch(
                'notifications/send',
                { message: i18n.t('register.invalid.ticket') },
                { root: true }
            );
            return false;
        }
    } else {
        if (typeof firstname !== 'string' || firstname.length === 0) {
            ctx.dispatch(
                'notifications/send',
                { message: i18n.t('register.invalid.firstname') },
                { root: true }
            );
            return false;
        }

        if (typeof lastname !== 'string' || lastname.length === 0) {
            ctx.dispatch(
                'notifications/send',
                { message: i18n.t('register.invalid.lastname') },
                { root: true }
            );
            return false;
        }

        if (typeof mail !== 'string' || mail.length === 0) {
            ctx.dispatch(
                'notifications/send',
                { message: i18n.t('register.invalid.mail') },
                { root: true }
            );
            return false;
        }
    }

    await ctx.dispatch('working/set', true, { root: true });

    const result = await ctx.dispatch(
        'request/post',
        {
            url: 'auth/register',
            body: {
                firstname,
                lastname,
                mail,
                ticketNumber,
                physicalId: card
            }
        },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });

    return result;
};
