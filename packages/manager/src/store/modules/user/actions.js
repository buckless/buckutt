export const login = async (ctx, { mail, pin }) => {
    await ctx.dispatch('working/set', true, { root: true });

    const res = await ctx.dispatch(
        'request/post',
        {
            url: 'login',
            body: {
                meanOfLogin: process.env.VUE_APP_DEFAULTMOL,
                data: mail,
                pin
            }
        },
        { root: true }
    );

    if (res && res.user) {
        await ctx.dispatch('setToken', res.token);
        await ctx.dispatch('setUser', res.user);
        await ctx.dispatch('load');
        await ctx.dispatch('setLinkedUsers', res.linkedUsers);
        await ctx.dispatch('working/set', false, { root: true });

        return res.user;
    }

    await ctx.dispatch('working/set', false, { root: true });
};

export const autologin = async ctx => {
    if (localStorage.hasOwnProperty('buckless/manager/user/token')) {
        const token = localStorage.getItem('buckless/manager/user/token');
        const user = JSON.parse(localStorage.getItem('buckless/manager/user/user'));
        const linkedUsers = JSON.parse(localStorage.getItem('buckless/manager/user/linkedUsers'));

        await ctx.dispatch('setToken', token);
        await ctx.dispatch('setUser', user);
        await ctx.dispatch('load');
        await ctx.dispatch('setLinkedUsers', linkedUsers);

        return true;
    }

    return false;
};

export const switchUser = async (ctx, username) => {
    await ctx.dispatch('working/set', true, { root: true });

    const body = { meanOfLogin: 'username', data: username };

    const res = await ctx.dispatch(
        'request/post',
        { url: 'auth/switchuser', body },
        { root: true }
    );

    if (res && res.user) {
        await ctx.dispatch('setToken', res.token);
        await ctx.dispatch('setUser', res.user);
        await ctx.dispatch('load');
        await ctx.dispatch('working/set', false, { root: true });

        return true;
    }

    await ctx.dispatch('working/set', false, { root: true });
    return false;
};

export const logout = ctx => {
    ctx.dispatch('changes/close', null, { root: true });
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
};

export const setToken = (ctx, token) => {
    localStorage.setItem('buckless/manager/user/token', token);
    ctx.commit('request/SET_TOKEN', token, { root: true });
};

export const setUser = (ctx, user) => {
    localStorage.setItem('buckless/manager/user/user', JSON.stringify(user));
    ctx.commit('SET_USER', user);
};

export const setLinkedUsers = (ctx, linkedUsers) => {
    localStorage.setItem('buckless/manager/user/linkedUsers', JSON.stringify(linkedUsers));
    ctx.commit('SET_LINKED_USERS', linkedUsers);
};

export function load(ctx) {
    ctx.dispatch('changes/init', localStorage.getItem('buckless/manager/user/token'), {
        root: true
    });
    ctx.dispatch('history/load', null, { root: true });
    ctx.dispatch('loadGiftReloads');
}

export const loadGiftReloads = async ctx => {
    const result = await ctx.dispatch(
        'request/get',
        { url: 'payment/giftReloads' },
        { root: true }
    );

    ctx.commit('SET_GIFT_RELOADS', result);
};
