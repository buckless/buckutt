<template>
    <div class="b-transfer">
        <div class="mdc-card">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Réaliser un virement</h1>
            </section>
            <form @submit.prevent="transferWrapper(currentPin, amount, user)">
                <section class="mdc-card__supporting-text">
                    Les opérations en ligne ne sont validées qu'à la suite une transaction sur site.
                    <b-autocomplete label="Destinataire" id="b-name" @input="defineUser" class="b--inputwidth" required="required" error="Un utilisateur doit être sélectionné"/>
                    <label class="mdc-text-field" ref="currentPin">
                        <input type="password" class="mdc-text-field__input" required minlength="4" v-model="currentPin">
                        <span class="mdc-text-field__label">Code PIN actuel</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                    <label class="mdc-text-field" ref="amount">
                        <input type="number" class="mdc-text-field__input" required step="0.01" min="0" v-model="amount">
                        <span class="mdc-text-field__label">Montant</span>
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
import Autocomplete from './Autocomplete';

export default {
    components: {
        'b-autocomplete': Autocomplete
    },

    data() {
        return {
            currentPin: '',
            amount: '',
            user: undefined
        };
    },

    methods: {
        ...mapActions(['transfer', 'notify']),

        defineUser(user) {
            this.user = user;
        },

        transferWrapper(currentPin, amount, user) {
            this.transfer({ currentPin, amount, user })
                .then(message => {
                    this.notify(message);
                    this.$router.push('/history');
                })
                .catch(error => this.notify(error));
        }
    },

    mounted() {
        MDCTextField.attachTo(this.$refs.currentPin);
        MDCTextField.attachTo(this.$refs.amount);
    }
};
</script>
