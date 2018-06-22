<template>
    <form @submit.prevent="sendRegister(firstname, lastname, mail, cgu, card)">
        <section class="mdc-card__supporting-text">
            <label class="mdc-text-field" ref="firstname">
                <input type="text" class="mdc-text-field__input" required v-model="firstname">
                <span class="mdc-text-field__label">Prénom</span>
                <div class="mdc-text-field__bottom-line"></div>
            </label>
            <label class="mdc-text-field" ref="lastname">
                <input type="text" class="mdc-text-field__input" required v-model="lastname">
                <span class="mdc-text-field__label">Nom</span>
                <div class="mdc-text-field__bottom-line"></div>
            </label>
            <label class="mdc-text-field" ref="mail">
                <input type="email" class="mdc-text-field__input" required v-model="mail">
                <span class="mdc-text-field__label">Mail</span>
                <div class="mdc-text-field__bottom-line"></div>
            </label>
            <label class="mdc-text-field" ref="card" v-if="hasCard">
                <input type="text" class="mdc-text-field__input" required v-model="card">
                <span class="mdc-text-field__label">Numéro de carte</span>
                <div class="mdc-text-field__bottom-line"></div>
            </label>
            <b-checkbox id="cgu" v-model="cgu">
                J'accepte les <a target="_blank" href="https://buckless.com/static/cgu.pdf">conditions générales d'utilisation</a>.
            </b-checkbox>
        </section>
        <section class="mdc-card__actions">
            <button type="submit" class="mdc-button mdc-button--raised" :disabled="working">Inscription</button>
            <div class="b-space"></div>
            <button type="button" class="mdc-button" :disabled="working" @click="back">Retour</button>
        </section>
    </form>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapState, mapActions } from 'vuex';
import Checkbox from './Checkbox';

export default {
    components: {
        'b-checkbox': Checkbox
    },

    data() {
        return {
            firstname: '',
            lastname: '',
            mail: '',
            card: '',
            cgu: false,
            working: false
        };
    },

    computed: {
        ...mapState({
            hasCard: state => state.register.card
        })
    },

    methods: {
        ...mapActions(['register', 'notify']),

        sendRegister(firstname, lastname, mail, cgu, card) {
            if (this.working) {
                return;
            }

            if (!cgu) {
                return this.notify({ message: 'Vous devez accepter les conditions générales.' });
            }

            this.working = true;

            this.register({ firstname, lastname, mail, card })
                .then(() => {
                    this.$router.push('/assign/success');
                })
                .catch(error => this.notify(error))
                .then(() => {
                    setTimeout(() => {
                        this.working = false;
                    }, 500);
                });
        },

        back() {
            this.$router.push('/register');
        }
    },

    mounted() {
        MDCTextField.attachTo(this.$refs.mail);
        MDCTextField.attachTo(this.$refs.firstname);
        MDCTextField.attachTo(this.$refs.lastname);
        if (this.$refs.card) {
            MDCTextField.attachTo(this.$refs.card);
        }
    }
};
</script>
