export default () => {
    try {
        navigator.app.loadUrl('file:///android_asset/www/index.html');
    } catch (err) {
        location.reload();
    }
};
