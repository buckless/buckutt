import uuid from 'uuid';
import humanError from '@/lib/humanError';

export const post = async (ctx, opts) => {
    opts.method = 'POST';
    opts.headers = Object.assign({}, ctx.getters.tokenHeader);

    opts.headers['Idempotency-Key'] = uuid();
    opts.headers['Content-Type'] = 'application/json';

    opts.body = JSON.stringify(opts.body);

    const res = await fetch(`${process.env.BASE_URL}api/${opts.url}`, opts);

    if (res.status === 200) {
        return await res.json();
    }

    if (res.status >= 400 && res.status < 500) {
        const body = await res.json();

        return ctx.dispatch(
            'notifications/send',
            { message: humanError(body.message) },
            { root: true }
        );
    }

    ctx.dispatch('notifications/send', { message: 'Serveur injoignable' }, { root: true });
};

export const get = async (ctx, opts) => {
    opts.method = 'GET';
    opts.headers = Object.assign({}, ctx.getters.tokenHeader);

    const res = await fetch(`${process.env.BASE_URL}api/${opts.url}`, opts);

    if (res.status === 200) {
        return await res.json();
    }

    if (res.status > 400 && res.status < 500) {
        const body = await res.json();

        return ctx.dispatch(
            'notifications/send',
            { message: humanError(body.message) },
            { root: true }
        );
    }

    ctx.dispatch('notifications/send', { message: 'Serveur injoignable' }, { root: true });
};

export const put = async (ctx, opts) => {
    opts.method = 'PUT';
    opts.headers = Object.assign({}, ctx.getters.tokenHeader);
    opts.headers['Content-Type'] = 'application/json';

    opts.body = JSON.stringify(opts.body);

    const res = await fetch(`${process.env.BASE_URL}api/${opts.url}`, opts);

    if (res.status === 200) {
        return await res.json();
    }

    if (res.status > 400 && res.status < 500) {
        const body = await res.json();

        return ctx.dispatch(
            'notifications/send',
            { message: humanError(body.message) },
            { root: true }
        );
    }

    ctx.dispatch('notifications/send', { message: 'Serveur injoignable' }, { root: true });
};
