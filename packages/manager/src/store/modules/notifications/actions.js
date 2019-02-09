export const send = (ctx, { message, timeout }) => {
    ctx.commit('PUSH_NOTIFICATION', message);

    const id = ctx.getters.lastId;

    setTimeout(() => {
        ctx.commit('CLEAR_NOTIFICATION', id);
    }, timeout || 4000);
};
