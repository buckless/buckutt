<template>
    <form @submit.prevent="sendAssign(ticketNumber, cgu, card)">
        <section class="mdc-card__supporting-text">
            <label class="mdc-text-field" ref="ticketNumber">
                <input type="text" class="mdc-text-field__input" required v-model="ticketNumber">
                <span class="mdc-text-field__label">Numéro de billet</span>
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
            cgu: false,
            ticketNumber: '',
            card: null,
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

        sendAssign(ticketNumber, cgu, card) {
            if (this.working) {
                return;
            }

            if (!cgu) {
                return this.notify({ message: 'Vous devez accepter les conditions générales.' });
            }

            this.working = true;

            this.register({ ticketNumber, card })
                .then(() => {
                    this.$router.push('/assign/success');
                })
                .catch(error => {
                    this.ticketNumberInput.valid = false;
                    return this.notify(error);
                })
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
        if (this.$refs.card) {
            MDCTextField.attachTo(this.$refs.card);
        }
        this.ticketNumberInput = MDCTextField.attachTo(this.$refs.ticketNumber);
    }
};
</script>
