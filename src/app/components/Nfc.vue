<template>
    <div class="b-writer">
        <template v-if="mode === 'write' && display">
            <div
                class="b-writer__drop"
                @click="cancel"></div>
            <div class="b-writer__modal">
                <div class="b-writer__modal__text">
                    <span v-if="rewrite">L'écriture de la carte a échoué</span>
                    <template v-else>Approchez la carte cashless</template>
                    <span>Gardez le contact jusqu'à la validation du paiement</span>
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
        mode: String
    },

    data() {
        return {
            inputValue: '',
            isCordova : process.env.TARGET === 'cordova',
            rewrite   : false,
            display   : true
        }
    },

    methods: {
        focus() {
            this.$refs.input.focus();
        },

        onCard(credit = null) {
            this.$emit('read', this.inputValue, credit);
        },

        cancel() {
            if (!this.rewrite) {
                this.display = false;
                this.$emit('cancel');
            }
        },

        hideVirtualKeyboard() {
            if (process.env.TARGET === 'cordova') {
                setTimeout(() => Keyboard.hide())
            }
        },

        setListeners() {
            if (!window.nfc) {
                setTimeout(this.setListeners, 1000);
                return;
            }

            const nfc = window.nfc;

            if (this.useCardData) {
                nfc.on('uid', (data) => {
                    this.inputValue = data.toString();
                });

                nfc.on('data', (data) => {
                    let credit;

                    try {
                        credit = nfc.dataToCredit(data.toLowerCase ? data.toLowerCase() : data, config.signingKey);
                        console.log('nfc-data', credit);
                    } catch (err) {
                        if (err.message === 'Signature does not match') {
                            console.log('signature does not match');
                        }

                        console.log(err);
                    }

                    this.onCard(credit);
                });
            } else {
                nfc.on('uid', (data) => {
                    this.inputValue = data;
                    this.onCard();
                });
            }

            nfc.on('error', (err) => {
                console.error(err);
            });

            this.$root.$on('readyToWrite', (credit) => {
                nfc
                    .write(nfc.creditToData(credit, config.signingKey))
                    .then(() => this.$root.$emit('writeCompleted'))
                    .catch(() => {
                        this.rewrite = true;
                    });
            });

            this.display = true;
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
            useCardData: state => state.auth.device.event.config.useCardData
        })
    },

    mounted() {
        this.setListeners();
    },

    beforeUpdate() {
        this.destroyListeners();
        this.setListeners();
    },

    beforeDestroy() {
        this.destroyListeners();
    }
}
</script>

<style scoped>
@import '../main.css';

.b-writer__drop {
    @add-mixin modal-drop;
}

.b-writer__modal {
    @add-mixin modal 350px;

    font-size: 18px;
    font-weight: bold;
    padding: 30px 0;
    text-align: center;
}

.b-writer__modal__text {
    & > span:first-child {
        display: inline-block;
        color: $red;
    }

    & > span:last-child {
        display: inline-block;
        margin: 10px 10px 0;
        font-size: 16px;
        font-weight: normal;
        color: $black !important;
    }
}
</style>
