export default () => {
    const redirectUrl = sessionStorage.hasOwnProperty('buckless/manager/redirect-after-login')
        ? sessionStorage.getItem('buckless/manager/redirect-after-login')
        : '/dashboard';

    sessionStorage.removeItem('buckless/manager/redirect-after-login');

    return redirectUrl;
};
