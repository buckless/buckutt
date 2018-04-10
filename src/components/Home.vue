<template>
    <div class="b-home">
        <div class="mdc-card">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Connexion</h1>
            </section>
            <form @submit.prevent="log(mail, pin)">
                <section class="mdc-card__supporting-text">
                    <label class="mdc-text-field" ref="mail">
                        <input type="email" class="mdc-text-field__input" required v-model="mail">
                        <span class="mdc-text-field__label">Mail</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                    <label class="mdc-text-field" ref="pin">
                        <input type="password" class="mdc-text-field__input" required minlength="4" v-model="pin">
                        <span class="mdc-text-field__label">Code PIN</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                </section>
                <section class="mdc-card__actions">
                    <button type="submit" class="mdc-button mdc-button--raised">Connexion</button>
                    <div class="b-space"></div>
                    <router-link tag="button" to="/forgot-pin" class="mdc-button">
                        PIN oublié
                    </router-link>
                </section>
            </form>
        </div>
    </div>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            mail: '',
            pin: ''
        };
    },

    methods: {
        ...mapActions(['login', 'notify']),

        log(mail, pin) {
            this.login({ meanOfLogin: process.env.defaultMol, data: mail, pin })
                .then(() => this.$router.push('/reload'))
                .catch(() => this.notify({ message: 'Identifiants incorrects.' }));
        }
    },

    computed: mapState({
        logged: state => !!state.app.loggedUser
    }),

    mounted() {
        MDCTextField.attachTo(this.$refs.mail);
        MDCTextField.attachTo(this.$refs.pin);
    }
};
</script>
