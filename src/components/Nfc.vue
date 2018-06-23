<template>
    <div class="b-writer">
        <template v-if="mode === 'write'">
            <div
                class="b-writer__drop"
                :success="success"
                :error="rewrite"
                @click="cancel"></div>
            <div class="b-writer__modal">
                <div class="b-writer__modal__text" v-if="!success">
                    <span v-if="rewrite && cardToRewrite === inputValue" class="b-writer__modal__text__error">L'écriture de la carte a échoué</span>
                    <span v-else-if="rewrite && cardToRewrite !== inputValue" class="b-writer__modal__text__error">La carte scannée est différente de l'originale</span>
                    <span v-else class="b-writer__modal__text__card">Approchez la carte cashless</span>
                    <span v-if="rewrite" class="b-writer__modal__text__card">Fermeture possible dans {{ timer }} secondes<br /><br /></span>
                    Gardez le contact jusqu'à la validation du paiement
                    <br /><br />
                    <slot></slot>
                </div>
                <div class="b-writer__modal__text" v-else>
                    {{ successTextUpdated }}
                </div>
            </div>
        </template>
        <template v-if="mode === 'read'">
            <input
                class="b--out-of-screen"
                type="text"
                ref="input"
                v-model="inputValue"
                :disabled="isCordova"
                @focus="hideVirtualKeyboard"
                @blur="focus"
                autofocus
                @keyup.enter="onCard" />
        </template>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        mode: String,
        successText: String,
        disableSignCheck: Boolean,
        disableLockCheck: Boolean,
        shouldPINLock: { type: Boolean, default: false },
        shouldPINUnlock: { type: Boolean, default: true }
    },

    data() {
        return {
            inputValue: '',
            cardToRewrite: '',
            isCordova: process.env.TARGET === 'cordova',
            rewrite: false,
            success: false,
            dataToWrite: {
                credit: null,
                options: null
            },
            timer: 15,
            currentTimer: null
        };
    },

    methods: {
        resetTimer() {
            this.timer = 15;
            if (this.currentTimer) {
                clearTimeout(this.currentTimer);
            }
            setTimeout(() => this.tickTimer(), 1000);
        },

        tickTimer() {
            this.timer = Math.max(0, this.timer - 1);

            if (this.timer > 0) {
                this.currentTimer = setTimeout(() => this.tickTimer(), 1000);
            }
        },

        focus() {
            if (this.$refs.input) {
                this.$refs.input.focus();
            }
        },

        onCard(credit = null, options = {}) {
            if (this.rewrite) {
                this.write();
            } else {
                this.$emit('read', this.inputValue, credit, options);
            }

            if (this.mode === 'read') {
                this.resetComponent();
            }
        },

        cancel() {
            if (!this.rewrite || this.timer === 0) {
                this.$emit('cancel');
            }
        },

        hideVirtualKeyboard() {
            if (process.env.TARGET === 'cordova') {
                setTimeout(() => Keyboard.hide());
            }
        },

        setListeners() {
            if (!window.nfc) {
                setTimeout(this.setListeners, 1000);
                return;
            }

            const nfc = window.nfc;

            if (this.useCardData) {
                if (nfc.shouldLock && nfc.shouldUnlock) {
                    nfc.shouldLock(this.shouldPINLock);
                    nfc.shouldUnlock(this.shouldPINUnlock);
                }

                nfc.on('uid', data => {
                    this.inputValue = data.toString();
                });

                nfc.on('data', data => {
                    try {
                        const card = nfc.dataToCard(
                            data.toLowerCase ? data.toLowerCase() : data,
                            this.inputValue + config.signingKey
                        );

                        console.log('nfc-data', card);

                        let cardToLock = false;
                        if (this.forbiddenIds.indexOf(this.inputValue) > -1) {
                            // Only write lock if it isn't already done
                            cardToLock = !card.options.locked;
                            card.options.locked = true;
                        }

                        if (card.options.locked && !this.disableLockCheck) {
                            if (cardToLock) {
                                this.dataToWrite = card;
                                this.write();
                            }
                            throw 'Locked card';
                        }

                        this.onCard(card.credit, card.options);
                    } catch (err) {
                        console.log(err);
                        if (err === 'Locked card') {
                            this.$store.commit('ERROR', { message: 'Locked card' });
                        } else if (!this.signCheckDisabled) {
                            this.$store.commit('ERROR', { message: 'Invalid card' });
                        } else {
                            return this.onCard(0, {});
                        }

                        this.resetComponent();
                    }
                });
            } else {
                nfc.on('uid', data => {
                    this.inputValue = data;
                    this.onCard();
                });
            }

            nfc.on('error', err => {
                console.error(err);
            });

            this.$root.$on('readyToWrite', (credit, options) => {
                this.dataToWrite = { credit, options };
                this.write();
            });
        },

        write() {
            let restartDataLoader = false;
            if (!this.dataLoaded) {
                restartDataLoader = true;
                this.$store.commit('SET_DATA_LOADED', true);
            }

            if (this.rewrite && this.cardToRewrite !== this.inputValue) {
                this.resetTimer();
                return Promise.reject();
            }

            this.cardToRewrite = this.inputValue;

            nfc.write(nfc.cardToData(this.dataToWrite, this.inputValue + config.signingKey))
                .then(() => {
                    this.success = true;
                    this.$root.$emit('writeCompleted');
                    if (restartDataLoader) {
                        this.$store.commit('SET_DATA_LOADED', false);
                    }
                })
                .catch(() => {
                    this.rewrite = true;
                    this.resetTimer();
                    this.$store.commit('SET_DATA_LOADED', true);
                });
        },

        destroyListeners() {
            window.nfc.removeAllListeners('data');
            window.nfc.removeAllListeners('uid');
            window.nfc.removeAllListeners('error');
            window.app.$root.$off('readyToWrite');
            window.app.$root.$off('writeCompleted');
        },

        resetComponent() {
            this.inputValue = '';
            this.cardToRewrite = '';
            this.success = false;
            this.rewrite = false;
            this.dataToWrite = {
                credit: null,
                options: null
            };
        }
    },

    computed: {
        ...mapState({
            useCardData: state => state.auth.device.event.config.useCardData,
            dataLoaded: state => state.ui.dataLoaded,
            forbiddenIds: state => state.online.offline.blockedCards
        }),

        successTextUpdated() {
            return this.successText || 'Transaction effectuée';
        },

        signCheckDisabled() {
            return this.disableSignCheck || this.rewrite;
        }
    },

    mounted() {
        this.resetComponent();
        this.setListeners();
    },

    beforeDestroy() {
        this.destroyListeners();
    },

    watch: {
        useCardData() {
            this.destroyListeners();
            this.setListeners();
        }
    }
};
</script>


<style scoped>
.b-writer__drop {
    background-color: rgba(34, 34, 34, 0.5);
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 5;
}

.b-writer__modal {
    background-color: #fff;
    border: 1px solid rgba(34, 34, 34, 0.5);
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(34, 34, 34, 0.3);
    left: 50%;
    padding: 20px;
    position: absolute;
    top: 150px;
    transform: translateX(-50%);
    width: calc(100% - 20px);
    max-width: 350px;
    z-index: 10;

    font-size: 16px;
    text-align: center;
}

.b-writer__modal__text__error {
    display: block;
    font-size: 18px;
    font-weight: bold;
    color: #e74c3c;
}

.b-writer__modal__text__card {
    display: block;
    margin: 10px 10px 0;
    font-size: 18px;
    font-weight: bold;
}

.b--out-of-screen {
    position: absolute;
    top: -9999px;
    left: -9999px;
    opacity: 0;
}
</style>
