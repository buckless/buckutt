<template>
    <form @submit.prevent="log(mail, pin)">
        <section class="mdc-card__supporting-text">
            <label class="mdc-text-field" ref="mail">
                <input type="text" class="mdc-text-field__input" :autofocus="!isInFrame" required v-model="mail">
                <span class="mdc-text-field__label">Mail ou nom d'utilisateur</span>
                <div class="mdc-text-field__bottom-line"></div>
            </label>
            <label class="mdc-text-field" ref="pin">
                <input type="password" class="mdc-text-field__input" required minlength="4" v-model="pin">
                <span class="mdc-text-field__label">Code PIN</span>
                <div class="mdc-text-field__bottom-line"></div>
            </label>
        </section>
        <section class="mdc-card__actions">
            <button type="submit" class="mdc-button mdc-button--raised" :disabled="working">Connexion</button>
            <div class="b-space"></div>
            <router-link tag="button" to="/forgot-pin" class="mdc-button">
                PIN oublié
            </router-link>
        </section>
    </form>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            mail: '',
            pin: '',
            working: false,
            isInFrame: window != window.top
        };
    },

    methods: {
        ...mapActions(['login', 'notify']),

        log(mail, pin) {
            if (this.working) {
                return;
            }

            this.working = true;

            this.login({ meanOfLogin: process.env.defaultMol, data: mail, pin })
                .then(() => this.$router.push('/reload'))
                .catch(() => this.notify({ message: 'Identifiants incorrects.' }))
                .then(() => {
                    setTimeout(() => {
                        this.working = false;
                    }, 500);
                });
        }
    },

    mounted() {
        MDCTextField.attachTo(this.$refs.mail);
        MDCTextField.attachTo(this.$refs.pin);
    }
};
</script>
