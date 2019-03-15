export const login = async (ctx, { mail, pin }) => {
    await ctx.dispatch('working/set', true, { root: true });

    const res = await ctx.dispatch(
        'request/post',
        {
            url: 'login',
            body: { mail, pin }
        },
        { root: true }
    );

    if (res && res.user) {
        await ctx.dispatch('setToken', res.token);
        await ctx.dispatch('setUser', res.user);
        await ctx.dispatch('working/set', false, { root: true });
        await ctx.dispatch('setCurrentWallet', res.user.wallets[0]);

        await ctx.dispatch('load');
        return res.user;
    }

    await ctx.dispatch('working/set', false, { root: true });
};

export const autologin = async ctx => {
    if (localStorage.hasOwnProperty('buckless/manager/user/token')) {
        const token = localStorage.getItem('buckless/manager/user/token');
        const user = JSON.parse(localStorage.getItem('buckless/manager/user/user'));

        await ctx.dispatch('setToken', token);
        await ctx.dispatch('setUser', user);
        await ctx.dispatch('setCurrentWallet', user.wallets[0]);

        await ctx.dispatch('load');

        return true;
    }

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

export const updateCurrentWallet = (ctx, wallet) => {
    ctx.commit('UPDATE_CURRENT_WALLET', wallet);
    localStorage.setItem('buckless/manager/user/user', JSON.stringify(ctx.getters.user));
};

export const setCurrentWallet = (ctx, wallet) => {
    ctx.commit('SET_CURRENT_WALLET', wallet.id);
    ctx.dispatch('load');
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
