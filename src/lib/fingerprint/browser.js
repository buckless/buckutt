window.setFingerprint = fingerprint => {
    localStorage.setItem("b-fingerprint", fingerprint);
    window.fingerprint = fingerprint;
};

if (localStorage.hasOwnProperty("b-fingerprint")) {
    window.fingerprint = localStorage.getItem("b-fingerprint");
} else {
    const todayDate = new Date();
    const formattedTodayDate =
        todayDate.getDate() + "/" + (todayDate.getMonth() + 1);
    window.setFingerprint(`dev-browser-${formattedTodayDate}`);
}

export default window.fingerprint;
