import nfc from '@/../lib/nfc';
const debug = require('debug')('router:health');

const delaT = 500;

export default class HealthDetector {
    constructor(router) {
        this.reset();
        this.router = router;

        nfc.on('atr', () => {
            this.nfcCard = true;
            debug(`timer:nfc ${Date.now()}`);
        });

        document.addEventListener(
            'pause',
            () => {
                this.lastPause = Date.now();
                debug(`timer:pause ${Date.now()}`);
            },
            false
        );

        document.addEventListener(
            'resume',
            () => {
                this.lastResume = Date.now();
                debug(`timer:resume ${Date.now()}`);

                this.openHealth();
            },
            false
        );
    }

    openHealth() {
        debug(`resume nfc:${this.nfcCard} resume:${this.lastResume} pause:${this.lastPause}`);

        const isHealthButton = !this.nfcCard && this.lastResume - this.lastPause <= delaT;

        // comment the following if you don't have a SOS button. Use card scan to trigger health page
        if (!isHealthButton) {
            return this.reset();
        }

        debug('health:triggered');

        this.router.push('/health');
    }

    reset() {
        this.nfcCard = false;
        this.lastPause = 0;
        this.lastResume = 0;
    }
}
