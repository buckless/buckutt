<template>
    <div class="b-writer">
        <template v-if="mode === 'write'">
            <div
                class="b-writer__drop"
                @click.stop="cancel"></div>
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
            dataToWrite: {
                credit: null,
                options: null
            }
        };
    },

    methods: {
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
            this.dataToWrite = {
                credit: null,
                options: null
            };

            const nfc = window.nfc;

            nfc.on('uid', data => {
                this.inputValue = data.toString();
            });

            nfc.on('data', data_ => {
                let card;

                try {
                    let data = data_.toLowerCase ? data_.toLowerCase() : data_;

                    card = nfc.dataToCard(data, this.inputValue + process.env.VUE_APP_SIGNINGKEY);

                    this.$emit('data', data);
                    this.onCard(card.credit, card.options);
                } catch (err) {
                    console.log(err);
                    if (!this.disableSignCheck) {
                        this.$store.commit('ERROR', { message: 'Invalid card' });
                    } else {
                        this.onCard(0, {});
                    }
                }
            });

            nfc.on('error', err => {
                console.error(err);
            });

            this.$root.$on('readyToWrite', (credit, options) => {
                console.log('on-ready-to-write', options);
                this.dataToWrite = { credit, options };
                this.write();
            });
        },

        write() {
            nfc
                .write(
                    nfc.cardToData(
                        this.dataToWrite,
                        this.inputValue + process.env.VUE_APP_SIGNINGKEY
                    )
                )
                .then(() => {
                    this.success = true;
                    this.$root.$emit('writeCompleted');
                })
                .catch(() => {
                    this.rewrite = true;
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
