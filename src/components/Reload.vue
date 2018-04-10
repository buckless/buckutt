<template>
    <div class="b-reload">
        <div class="mdc-card">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Recharger en ligne</h1>
            </section>
            <form @submit.prevent="reload(amount)">
                <section class="mdc-card__supporting-text">
                    Vous serez redirigé vers un site bancaire <strong>sécurisé</strong>.<br />
                    Les opérations en ligne ne sont validées qu'à la suite une transaction sur site.
                    <div class="b-reload-gifts" v-if="giftReloads.length > 0">

                        <div class="b-reload-gifts__gift" v-for="giftReload in giftReloads">
                            Tous les <span>{{ giftReload.everyAmount | price(true) }}</span>, recevez
                            <strong>{{ giftReload.amount | price(true) }}</strong> supplémentaire<template v-if="giftReload.amount > 100">s</template>.
                        </div>
                    </div>
                    <div class="b-reload__boxes">
                        <button class="mdc-button"
                            @click.prevent="chooseBox(10)"
                            :class="[(chosenBox === 10) ? 'mdc-button--raised' : 'mdc-button--stroked']">
                            10€
                        </button>
                        <button class="mdc-button"
                            @click.prevent="chooseBox(20)"
                            :class="[(chosenBox === 20) ? 'mdc-button--raised' : 'mdc-button--stroked']">
                            20€
                        </button>
                        <button class="mdc-button"
                            @click.prevent="chooseBox(40)"
                            :class="[(chosenBox === 40) ? 'mdc-button--raised' : 'mdc-button--stroked']">
                            40€
                        </button>
                        <button class="mdc-button"
                            @click.prevent="chosenBox = 'custom'"
                            :class="[(chosenBox === 'custom') ? 'mdc-button--raised' : 'mdc-button--stroked']">
                            <i class="material-icons">more_horiz</i>
                        </button>
                    </div>
                    <label class="mdc-text-field" ref="amount" v-show="chosenBox === 'custom'">
                        <input
                            type="number"
                            class="mdc-text-field__input"
                            max="100" min="5" step="0.10" pattern="[0-9]*(\.[0-9]+)?"
                            error="Veuillez entrer un montant correct"
                            v-model="amount">
                        <span class="mdc-text-field__label">Montant personnalisé</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                </section>
                <section class="mdc-card__actions" v-show="chosenBox === 'custom'">
                    <button class="mdc-button mdc-button--raised" :disabled="loading">Valider</button>
                    <div class="b-space"></div>
                </section>
            </form>
        </div>
    </div>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapState, mapActions } from 'vuex';
import { post } from '../lib/fetch';

export default {
    data() {
        return {
            loading: false,
            amount: null,
            chosenBox: null
        };
    },

    computed: {
        ...mapState({
            giftReloads: state => state.app.giftReloads
        })
    },

    methods: {
        chooseBox(amount) {
            this.chosenBox = amount;
            this.reload(amount);
        },

        reload(amount) {
            this.loading = true;

            post('reload', { amount: parseInt(amount * 100, 10) }).then(data => {
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
        line-height: 16px;
    }
}
</style>
