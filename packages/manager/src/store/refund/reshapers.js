export const reshapeCardRegister = data => ({
    outcome: 'success',
    type: data.type,
    data: {
        nextUrl: data.res
    }
});
