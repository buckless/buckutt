<template>
    <div class="b-pricechooser">
        <div class="b-pricechooser__drop" @click="closeChooser"></div>
        <div class="b-pricechooser__modal">
            <div class="b-pricechooser__modal__topbar">
                <h3 class="b-pricechooser__modal__topbar__title">Choix du prix</h3>
                <h3 class="b-pricechooser__modal__topbar__cancel" @click="closeChooser">
                    Annuler
                </h3>
            </div>
            <div class="b-pricechooser__modal__currency">
                <currency :value="priceAmount"></currency>
            </div>
            <div>
                <div class="b-pricechooser__modal__numerical-input">
                    <numerical-input
                        @changed="updateCurrency"
                        @validate="validate"
                        ref="input"
                    ></numerical-input>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

import Currency from '@/components/Currency';
import NumericalInput from '@/components/NumericalInput';

export default {
    components: {
        Currency,
        NumericalInput
    },

    data() {
        return {
            item: null,
            priceAmount: 0
        };
    },

    computed: mapGetters(['wiketItems']),

    methods: {
        ...mapActions(['addItemToBasket']),

        updateCurrency(amount) {
            this.priceAmount = parseInt(amount || 0, 10);
        },

        closeChooser() {
            if (this.$refs.input) {
                this.$refs.input.clear();
            }

            this.$router.push('/items');
        },

        validate() {
            if (this.priceAmount !== this.item.price.amount) {
                this.addItemToBasket({
                    ...this.item,
                    paidPrice: this.priceAmount
                });
            } else {
                this.addItemToBasket(this.item);
            }

            this.closeChooser();
        }
    },

    mounted() {
        this.item = this.wiketItems.items.find(item => item.id === this.$router.currentRoute.params.item);

        if (!this.item || !this.item.freePrice) {
            return this.closeChooser();
        }

        this.priceAmount = this.item.price.amount;
    },

    closeChooser() {
        this.closeReload();
    }
};
</script>

<style scoped>
@import '../main.css';

.b-pricechooser__drop {
    @add-mixin modal-drop;
}

.b-pricechooser__modal {
    @add-mixin modal 450px;
}

.b-pricechooser__modal__topbar {
    display: flex;
    align-items: center;
    padding: 15px;
}

.b-pricechooser__modal__topbar__title {
    flex: 1;
    font-size: 16px;
    font-weight: normal;
    margin: 0;
}

.b-pricechooser__modal__topbar__cancel {
    color: $lightblue;
    cursor: pointer;
    flex: 0;
    font-size: 14px;
    font-weight: 400;
    margin: 0;
    text-transform: uppercase;
}

.b-pricechooser__modal__currency {
    color: color($black a(0.65));
    font-size: 25px;
    margin-bottom: 15px;
    text-align: center;
}

.b-pricechooser__modal__numerical-input {
    margin: 0 auto 20px auto;
    width: 90%;
}

@media (max-width: 768px) {
    .b-pricechooser__modal {
        max-width: 310px;
        padding: 10px 20px;
    }

    .b-pricechooser__modal__numerical-input {
        margin-bottom: 10px;
    }
}
</style>
