<template>
    <div class="b-writer">
        <template v-if="mode === 'write'">
            <div
                class="b-writer__drop"
                @click="cancel"></div>
            <div class="b-writer__modal">
                <div class="b-writer__modal__text" v-if="!success">
                    <span v-if="rewrite" class="b-writer__modal__text__error">L'écriture de la carte a échoué</span>
                    <span v-else class="b-writer__modal__text__card">Approchez la carte cashless</span>
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
        disableSignCheck: Boolean
    },

    data() {
        return {
            inputValue: '',
            isCordova: process.env.TARGET === 'cordova',
            rewrite: false,
            success: false,
            dataToWrite: null
        };
    },

    methods: {
        focus() {
            if (this.$refs.input) {
                this.$refs.input.focus();
            }
        },

        onCard(credit = null) {
            if (this.rewrite) {
                this.write();
            } else {
                this.$emit('read', this.inputValue, credit);
            }
        },

        cancel() {
            if (!this.rewrite) {
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

            this.success = false;
            this.rewrite = false;
            this.dataToWrite = null;

            const nfc = window.nfc;

            if (this.useCardData) {
                nfc.on('uid', data => {
                    this.inputValue = data.toString();
                });

                nfc.on('data', data => {
                    let credit;

                    try {
                        credit = nfc.dataToCredit(
                            data.toLowerCase ? data.toLowerCase() : data,
                            config.signingKey
                        );
                        console.log('nfc-data', credit);
                        this.onCard(credit);
                    } catch (err) {
                        console.log(err);
                        if (!this.disableSignCheck) {
                            this.$store.commit('ERROR', { message: 'Invalid card' });
                        } else {
                            this.onCard(0);
                        }
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

            this.$root.$on('readyToWrite', credit => {
                this.dataToWrite = credit;
                this.write();
            });
        },

        write() {
            let restartDataLoader = false;
            if (!this.dataLoaded) {
                restartDataLoader = true;
                this.$store.commit('SET_DATA_LOADED', true);
            }

            nfc
                .write(nfc.creditToData(this.dataToWrite, config.signingKey))
                .then(() => {
                    this.success = true;
                    this.$root.$emit('writeCompleted');
                    if (restartDataLoader) {
                        this.$store.commit('SET_DATA_LOADED', false);
                    }
                })
                .catch(() => {
                    this.rewrite = true;
                    this.$store.commit('SET_DATA_LOADED', true);
                });
        },

        destroyListeners() {
            window.nfc.removeAllListeners('data');
            window.nfc.removeAllListeners('uid');
            window.nfc.removeAllListeners('error');
            window.app.$root.$off('readyToWrite');
            window.app.$root.$off('writeCompleted');
        }
    },

    computed: {
        ...mapState({
            useCardData: state => state.auth.device.event.config.useCardData,
            dataLoaded: state => state.ui.dataLoaded
        }),

        successTextUpdated() {
            return this.successText || 'Transaction effectuée';
        }
    },

    mounted() {
        this.setListeners();
    },

    beforeDestroy() {
        this.destroyListeners();
    }
};
</script>

<style scoped>
@import '../main.css';

.b-writer__drop {
    @add-mixin modal-drop;
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
