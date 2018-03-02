<template>
    <div class="b-reload">
        <div class="mdc-card">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Recharger en ligne</h1>
            </section>
            <form @submit.prevent="reload(customAmount || amount)">
                <section class="mdc-card__supporting-text">
                    Vous serez redirigé vers un site bancaire <strong>sécurisé</strong>.
                    <br/>
                    Toutes les opérations en ligne ne sont effectives qu'après une opération physique.
                    <div class="b-reload__boxes">
                        <button class="mdc-button"
                            @click.prevent="chooseBox(10)"
                            :class="[(amount === 10 && !customAmount) ? 'mdc-button--raised' : 'mdc-button--stroked']">
                            10€
                        </button>
                        <button class="mdc-button"
                            @click.prevent="chooseBox(20)"
                            :class="[(amount === 20 && !customAmount) ? 'mdc-button--raised' : 'mdc-button--stroked']">
                            20€
                        </button>
                        <button class="mdc-button"
                            @click.prevent="chooseBox(40)"
                            :class="[(amount === 40 && !customAmount) ? 'mdc-button--raised' : 'mdc-button--stroked']">
                            40€
                        </button>
                    </div>
                    <label class="mdc-text-field" ref="amount">
                        <input
                            type="number"
                            class="mdc-text-field__input"
                            :required="!amount" max="100" min="5" step="0.10" pattern="[0-9]*(\.[0-9]+)?"
                            error="Veuillez entrer un montant correct"
                            v-model="customAmount">
                        <span class="mdc-text-field__label">Montant personnalisé</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                </section>
                <section class="mdc-card__actions">
                    <button class="mdc-button mdc-button--raised" :disabled="loading">Valider</button>
                    <div class="b-space"></div>
                </section>
            </form>
        </div>
    </div>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapActions }   from 'vuex';
import { post }         from '../lib/fetch';

export default {
    data() {
        return {
            loading     : false,
            amount      : 10,
            customAmount: null
        };
    },

    methods: {
        chooseBox(amount) {
            this.customAmount = null;
            this.amount       = amount;
        },

        reload(amount) {
            this.loading = true;

            post('reload', { amount: parseInt(amount * 100, 10) })
                .then((data) => {
                    if (data.status) {
                        this.notify(data.message);

                        setTimeout(() => {
                            this.loading = false;
                        }, 200);
                    }

                    if (data.type === 'url') {
                        window.location.href = data.res;
                    }
                });
        },


        ...mapActions(['notify'])
    },

    mounted() {
        MDCTextField.attachTo(this.$refs.amount);
    }
};
</script>

<style>
    .b-reload__boxes {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 0px;

        & > button {
            width: 80px;
            height: 40px;
            font-size: 16px;
            margin: 0px 10px;
        }
    }
</style>
