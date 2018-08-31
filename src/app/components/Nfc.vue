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
/* global Keyboard */
import { mapState } from 'vuex';
import { EventEmitter } from 'events';
import nfc from '@/../lib/nfc';
import debug_ from 'debug';

const debug = debug_('nfc:vue');

const noSign = true;

export default {
    props: {
        mode: String,
        successText: String,
        disableSignCheck: Boolean,
        disableLockCheck: Boolean,
        disablePinCheck: Boolean
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
                options: null,
                version: null
            },
            timer: 15,
            currentTimer: null,
            cardLocked: false
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

        onCard(credit = null, options = {}, version = null) {
            if (this.rewrite) {
                debug('onCard rewrite');
                this.write();
            } else {
                debug('onCard read');
                this.$emit('read', this.inputValue, credit, options, version);
            }

            if (this.mode === 'read') {
                this.resetComponent();
            }
        },

        cancel() {
            debug('cancel');
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
            debug('set listeners');
            if (!nfc) {
                throw new Error('nfc not available');
            }

            if (this.useCardData) {
                debug('use card data');

                nfc.on('uid', data => {
                    debug('on uid');
                    this.inputValue = data.toString();
                });

                nfc.on('locked', locked => {
                    debug('on locked');
                    this.cardLocked = locked;

                    if (nfc.shouldUnlock) {
                        debug('should unlock');
                        nfc.shouldUnlock(locked);
                    }

                    if (nfc.shouldLock) {
                        debug('should lock');
                        nfc.shouldLock(!locked);
                    }
                });

                nfc.on('data', data => {
                    debug('on data ', data);
                    try {
                        const card = nfc.dataToCard(
                            data.toLowerCase ? data.toLowerCase() : data,
                            this.inputValue + config.signingKey
                        );

                        debug('card ', card);

                        let cardToLock = false;
                        if (this.forbiddenIds.indexOf(this.inputValue) > -1) {
                            debug('lock card');
                            // Only write lock if it isn't already done
                            cardToLock = !card.options.locked;
                            card.options.locked = true;
                        }

                        this.dataToWrite = card;

                        if (card.options.locked && !this.disableLockCheck) {
                            if (cardToLock) {
                                this.write();
                            }
                            throw 'Locked card';
                        }

                        this.onCard(card.credit, card.options, card.version);
                    } catch (err) {
                        if (err === 'Locked card') {
                            debug('locked card');
                            this.$store.commit('ERROR', {
                                message: 'Locked card'
                            });
                        } else if (
                            this.signCheckDisabled &&
                            err.message === '[signed-data] signature does not match'
                        ) {
                            debug('signature does not match');
                            if (!this.cardLocked) {
                                debug('card not locked');
                                return this.onCard(0, { catering: [] });
                            }

                            debug('card locked');
                            return this.onCard(
                                err.value.credit,
                                err.value.options,
                                err.value.version
                            );
                        } else if (this.disablePinCheck) {
                            debug('pin check disabled');
                            return this.onCard(0, { catering: [] });
                        } else {
                            debug('invalid card ', err);
                            this.$store.commit('ERROR', {
                                message: 'Invalid card'
                            });
                        }

                        this.resetComponent();
                    }
                });
            } else {
                debug('no use card data');
                nfc.on('uid', data => {
                    debug('on uid');
                    this.inputValue = data;
                    this.onCard();
                });
            }

            nfc.on('error', err => {
                debug('on error ', err);
                console.error(err);
            });

            this.$root.$on('readyToWrite', (credit, options, version) => {
                debug('on ready to write');

                if (typeof credit === 'number') {
                    this.dataToWrite.credit = credit;
                }

                if (options) {
                    this.dataToWrite.options = options;
                }

                if (typeof version === 'number') {
                    this.dataToWrite.version = version;
                }

                this.write();
            });

            debug('uid listener count: ', EventEmitter.listenerCount(nfc, 'uid'));
            debug('locked listener count: ', EventEmitter.listenerCount(nfc, 'locked'));
            debug('data listener count: ', EventEmitter.listenerCount(nfc, 'data'));
            debug('error listener count: ', EventEmitter.listenerCount(nfc, 'error'));
        },

        write() {
            debug('write');
            let restartDataLoader = false;
            if (!this.dataLoaded) {
                debug('data loaded');
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
                    debug('write completed');
                    this.success = true;
                    this.$root.$emit('writeCompleted');
                    if (restartDataLoader) {
                        debug('data not loaded');
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
            debug('destroy listeners');
            window.app.$root.$off('readyToWrite');
            window.app.$root.$off('writeCompleted');

            if (!nfc) {
                return;
            }

            debug('remove all listeners');
            nfc.removeAllListeners('data');
            nfc.removeAllListeners('locked');
            nfc.removeAllListeners('uid');
            nfc.removeAllListeners('error');
        },

        resetComponent() {
            debug('reset component');
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
            return noSign || this.disableSignCheck || this.rewrite;
        }
    },

    checkDisabled() {
        return this.disableSignCheck || this.rewrite;
    },

    mounted() {
        debug('mounting component...');
        this.resetComponent();
        this.setListeners();
    },

    beforeDestroy() {
        debug('destroying component...');
        this.destroyListeners();
    },

    watch: {
        useCardData() {
            debug('useCardData changed');
            this.destroyListeners();
            this.setListeners();
        }
    }
};
</script>

<style scoped>
@import '../main.css';

.b-writer__drop {
    @add-mixin modal-drop;

    &[success] {
        background-color: $green;
    }

    &[error] {
        background-color: $red;
    }
}

.b-writer__modal {
    @add-mixin modal 350px;

    font-size: 16px;
    text-align: center;
}

.b-writer__modal__text {
    & > .b-writer__modal__text__error {
        display: block;
        font-size: 18px;
        font-weight: bold;
        color: $red;
    }

    & > .b-writer__modal__text__card {
        display: block;
        margin: 10px 10px 0;
        font-size: 18px;
        font-weight: bold;
    }
}
</style>
