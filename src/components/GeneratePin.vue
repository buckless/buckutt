<template>
    <div class="b-generatepin">
        <div class="mdc-card" v-if="!key">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Code PIN oublié</h1>
            </section>
            <form @submit.prevent="ask(mail)">
                <section class="mdc-card__supporting-text">
                    <label class="mdc-text-field" ref="mail">
                        <input type="email" class="mdc-text-field__input" required v-model="mail">
                        <span class="mdc-text-field__label">Mail</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                </section>
                <section class="mdc-card__actions">
                    <button class="mdc-button mdc-button--raised" v-show="!loading">Envoyer</button>
                    <button class="mdc-button mdc-button--raised" v-show="loading" disabled>En cours...</button>
                    <div class="b-space"/>
                    <router-link tag="button" to="/" class="mdc-button">
                        Retour
                    </router-link>
                </section>
            </form>
        </div>
        <div class="mdc-card" v-else>
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Réinitialisation du code PIN</h1>
            </section>
            <form @submit.prevent="change(key, pin, confirmedPin)">
                <section class="mdc-card__supporting-text">
                    Le nouveau code PIN doit exclusivement être composé de 4 chiffres.
                    <label class="mdc-text-field" ref="pin">
                        <input type="password" class="mdc-text-field__input" required pattern="\d{4}" v-model="pin">
                        <span class="mdc-text-field__label">Nouveau code PIN</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                    <label class="mdc-text-field" ref="confirmedPin">
                        <input type="password" class="mdc-text-field__input" required pattern="\d{4}" v-model="confirmedPin">
                        <span class="mdc-text-field__label">Confirmation</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                </section>
                <section class="mdc-card__actions">
                    <button class="mdc-button mdc-button--raised">Modifier</button>
                    <div class="b-space" />
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
            mail: '',
            pin: '',
            confirmedPin: '',
            key: this.$route.query.key,
            loading: false
        };
    },

    methods: {
        ...mapActions(['askPin', 'generatePin', 'notify']),

        change(key, pin, confirmedPin) {
            this.generatePin({ key, pin, confirmedPin })
                .then(message => {
                    this.pin = '';
                    this.confirmedPin = '';
                    this.notify(message);
                    this.$router.push('/');
                })
                .catch(error => this.notify(error));
        },

        ask(mail) {
            this.loading = true;
            this.askPin(mail)
                .then(message => {
                    this.notify(message);
                    this.$router.push('/');
                })
                .catch(error => {
                    this.loading = false;
                    this.notify(error);
                });
        }
    },

    mounted() {
        if (!this.key) {
            MDCTextField.attachTo(this.$refs.mail);
        } else {
            MDCTextField.attachTo(this.$refs.pin);
            MDCTextField.attachTo(this.$refs.confirmedPin);
        }
    }
};
</script>
