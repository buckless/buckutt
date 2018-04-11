<template>
    <div class="b-changepin">
        <div class="mdc-card">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Changement de code PIN</h1>
            </section>
            <form @submit.prevent="change(currentPin, pin, confirmedPin)">
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
        </div>
    </div>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            currentPin: '',
            pin: '',
            confirmedPin: ''
        };
    },

    methods: {
        ...mapActions(['changePin', 'notify']),

        change(currentPin, pin, confirmedPin) {
            this.changePin({ currentPin, pin, confirmedPin })
                .then(message => {
                    this.currentPin = '';
                    this.pin = '';
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
