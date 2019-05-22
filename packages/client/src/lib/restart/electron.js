export default () => {
    try {
        require('electron').remote.app.relaunch();
    } catch (err) {
        location.reload();
    }
};
