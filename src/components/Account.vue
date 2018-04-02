<template>
    <div class="b-account">
        <div class="mdc-card">
            <section class="mdc-card__primary" @click="pinPage = !pinPage">
                <h1 class="mdc-card__title mdc-card__title--large">Changer mon code PIN</h1>
            </section>
            <transition name="slide">
                <form class="b-changepin" @submit.prevent="change(currentPin, pin, confirmedPin)" v-show="pinPage">
                    <section class="mdc-card__supporting-text">
                        <label class="mdc-text-field" ref="currentPin">
                            <input type="password" class="mdc-text-field__input" required minlength="4" v-model="currentPin">
                            <span class="mdc-text-field__label">Code PIN actuel</span>
                            <div class="mdc-text-field__bottom-line"></div>
                        </label>
                        <label class="mdc-text-field" ref="pin">
                            <input type="password" class="mdc-text-field__input" required minlength="4" v-model="pin">
                            <span class="mdc-text-field__label">Nouveau code PIN</span>
                            <div class="mdc-text-field__bottom-line"></div>
                        </label>
                        <label class="mdc-text-field" ref="confirmedPin">
                            <input type="password" class="mdc-text-field__input" required minlength="4" v-model="confirmedPin">
                            <span class="mdc-text-field__label">Confirmation</span>
                            <div class="mdc-text-field__bottom-line"></div>
                        </label>
                    </section>
                    <section class="mdc-card__actions">
                        <button class="mdc-button mdc-button--raised">Valider</button>
                    </section>
                </form>
            </transition>
        </div>
        <div class="mdc-card" v-if="mol && mol.data">
            <section class="mdc-card__primary" @click="qrPage = !qrPage">
                <h1 class="mdc-card__title mdc-card__title--large">Mon QR Code</h1>
            </section>
            <transition name="slide">
                <div class="b-qrcode" @submit.prevent="change(currentPin, pin, confirmedPin)" v-show="qrPage">
                    Une fois sur place, vous pourrez utiliser ce QR Code ou votre billet pour récupérer votre support cashless.
                    <img :src="qrcode" alt="qr code" />
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { MDCTextField }         from '@material/textfield/dist/mdc.textfield.min.js';
import { mapActions, mapState } from 'vuex';

export default {
    data() {
        return {
            qrPage      : false,
            pinPage     : false,
            currentPin  : '',
            pin         : '',
            confirmedPin: ''
        };
    },

    computed: {
        ...mapState({
            mol: state => state.app.loggedUser.meansOfLogin.find(mol => mol.type === 'ticketId')
        }),

        qrcode() {
            return `https://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=${this.mol.data || ''}`;
        }
    },

    methods: {
        ...mapActions([
            'changePin',
            'notify'
        ]),

        change(currentPin, pin, confirmedPin) {
            this.changePin({ currentPin, pin, confirmedPin })
                .then((message) => {
                    this.currentPin   = '';
                    this.pin          = '';
                    this.confirmedPin = '';
                    this.notify(message);
                })
                .catch(error => this.notify(error));
        }
    },

    mounted() {
        MDCTextField.attachTo(this.$refs.currentPin);
        MDCTextField.attachTo(this.$refs.pin);
        MDCTextField.attachTo(this.$refs.confirmedPin);
    }
};
</script>

<style>
.b-account h1 {
    padding: 0 !important;
}

.b-account .mdc-card:not(:first-child) {
    margin-top: 24px;
}

.b-account img {
    max-width: 100%;
    margin: 0 auto;
    display: block;
}

.b-account .b-qrcode {
    padding: 0 16px;
}
</style>
