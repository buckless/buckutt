if (localStorage.hasOwnProperty('b-fingerprint')) {
    window.fingerprint = localStorage.getItem('b-fingerprint');
}

window.setFingerprint = fingerprint => {
    localStorage.setItem('b-fingerprint', fingerprint);
    window.fingerprint = fingerprint;
};

module.exports = window.fingerprint;
