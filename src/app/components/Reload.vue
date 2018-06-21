<template>
    <div
        class="b-reload"
        :class="{ 'b-reload--reloadOnly': reloadOnly }">
        <div
            class="b-reload__drop"
            v-if="!reloadOnly"
            @click="closeReload"></div>
        <div class="b-reload__modal" :class="{ 'b-reload__modal--fromtop': reloadSum > 0 }">
            <div class="b-reload__modal__topbar">
                <h3 class="b-reload__modal__topbar__title">Rechargement</h3>
                <h3
                    class="b-reload__modal__topbar__cancel"
                    v-if="!reloadOnly"
                    @click="closeReload">
                    Annuler
                </h3>
            </div>
            <div class="b-reload__modal__methods">
                <methods :disabled="reloadState === 'confirm'"></methods>
            </div>
            <div class="b-reload__modal__currency">
                <currency :value="reloadAmount"></currency>
                <span class="b-reload__modal__currency__gift" v-if="reloadGiftAmount > 0">
                    +<currency :value="reloadGiftAmount"></currency>
                </span>
            </div>
            <div v-show="reloadState === 'opened' || reloadOnly">
                <div class="b-reload__modal__numerical-input">
                    <unit-input
                        v-if="meanOfPayment === 'returned'"
                        v-model="reloadAmount"
                        @validate="confirmReloadModal"
                        ref="input"></unit-input>
                    <numerical-input
                        v-else
                        @changed="updateCurrency"
                        @validate="confirmReloadModal"
                        ref="input"></numerical-input>
                </div>
            </div>
            <div
                class="b-reload__modal__confirm"
                v-show="reloadState === 'confirm'">
                <div class="b-reload__modal__buttons">
                    <button @click="reload"><span>Paiement</span> accepté</button>
                    <button @click="cancelReloadModal"><span>Paiement</span> refusé</button>
                </div>
            </div>
        </div>
        <nfc mode="read" @read="logBuyer" v-if="!loggedBuyer.isAuth && reloadOnly && isWaiting && !isWriting" key="read" />
        <nfc mode="write" @read="validate" @cancel="cancelReload" v-if="reloadOnly && isWriting" key="write"/>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import Currency from './Currency';
import Methods from './Reload-Methods';
import NumericalInput from './NumericalInput';
import UnitInput from './UnitInput';

export default {
    props: {
        reloadOnly: { type: Boolean, required: false, default: false }
    },

    components: {
        Currency,
        Methods,
        NumericalInput,
        UnitInput
    },

    data() {
        return {
            reloadAmount: 0
        };
    },

    computed: {
        ...mapState({
            loggedBuyer: state => state.auth.buyer,
            reloadState: state => state.reload.reloadState,
            isWaiting: state => state.basket.basketStatus === 'WAITING',
            isWriting: state => state.basket.writing,
            giftReloads: state => state.items.giftReloads,
            meanOfPayment: state => state.reload.meanOfPayment
        }),

        ...mapGetters(['reloadSum']),

        reloadGiftAmount() {
            return this.giftReloads
                .map(gr => {
                    const timesEveryAmount = Math.floor(this.reloadAmount / gr.everyAmount);

                    return timesEveryAmount * gr.amount;
                })
                .reduce((a, b) => a + b, 0);
        }
    },

    methods: {
        updateCurrency(amount) {
            this.reloadAmount = parseInt(amount || 0, 10);
        },

        closeReload() {
            if (this.$refs.input) {
                this.$refs.input.clear();
            }
            this.closeReloadModal();
        },

        reload() {
            this.addReload({
                amount: this.reloadAmount,
                type: this.meanOfPayment,
                trace: ''
            });

            if (this.reloadGiftAmount) {
                this.addReload({
                    amount: this.reloadGiftAmount,
                    type: 'gift',
                    trace: `${this.meanOfPayment}-${this.reloadAmount}`
                });
            }

            let initialPromise = Promise.resolve();

            if (this.reloadOnly) {
                initialPromise = initialPromise
                    .then(() => this.basketClickValidation())
                    .then(() => this.clearBasket());
            }

            initialPromise.then(() => this.closeReload());
        },

        logBuyer(cardNumber, credit, options) {
            console.log('reload-buyer-login', cardNumber, credit, options);
            this.buyer({
                cardNumber,
                credit: Number.isInteger(credit) ? credit : null
            });
        },

        validate(cardNumber, credit, options) {
            console.log('reload-validate', cardNumber, credit, options);
            this.validateBasket({
                cardNumber,
                credit: Number.isInteger(credit) ? credit : null,
                options
            });
        },

        cancelReload() {
            this.$store.commit('SET_WRITING', false);
            this.$store.commit('SET_BASKET_STATUS', 'WAITING');
            this.clearBasket();
        },

        ...mapActions([
            'confirmReloadModal',
            'closeReloadModal',
            'addReload',
            'clearBasket',
            'cancelReloadModal',
            'validateBasket',
            'basketClickValidation',
            'buyer'
        ])
    },

    beforeDestroy() {
        this.closeReload();
    }
};
</script>

<style scoped>
@import '../main.css';

.b-reload--reloadOnly {
    flex: 1;

    & .b-reload__modal {
        position: static;
        transform: none !important;
        margin: 10px auto;
    }
}

.b-reload__drop {
    @add-mixin modal-drop;
}

.b-reload__modal {
    @add-mixin modal 450px;
}

.b-reload__modal__topbar {
    display: flex;
    align-items: center;
    padding: 15px;
}

.b-reload__modal__topbar__title {
    flex: 1;
    font-size: 16px;
    font-weight: normal;
    margin: 0;
}

.b-reload__modal__topbar__cancel {
    color: $lightblue;
    cursor: pointer;
    flex: 0;
    font-size: 14px;
    font-weight: 400;
    margin: 0;
    text-transform: uppercase;
}

.b-reload__modal__methods {
    margin: 15px auto;
    width: 360px;
}

.b-reload__modal__currency {
    color: color($black a(0.65));
    font-size: 25px;
    margin-bottom: 15px;
    text-align: center;
}

.b-reload__modal__currency__gift {
    font-size: 75%;
}

.b-reload__modal__numerical-input {
    margin: 0 auto 20px auto;
    width: 90%;
}

.b-reload__modal__buttons {
    display: flex;
    flex-direction: column;

    & > button {
        border: 0;
        background-color: $green;
        border-radius: 2px;
        box-shadow: 0 2px 4px color($black a(0.25));
        color: #fff;
        cursor: pointer;
        height: 45px;
        text-transform: uppercase;
    }

    & > button:last-child {
        background-color: $lightorange;
        margin: 10px 0;
    }
}

@media (max-width: 768px) {
    .b-reload--reloadOnly {
        & .b-reload__modal {
            transform: translateX(-50%);
            top: 140px;

            &.b-reload__modal--fromtop {
                top: 150px;
            }
        }
    }

    .b-reload__modal {
        padding: 10px 20px;
    }

    .b-reload__modal__topbar {
        display: none;
    }

    .b-reload__modal {
        max-width: 310px;
    }

    .b-reload__modal__methods {
        flex-wrap: wrap;
        width: 100%;
    }

    .b-reload__modal__numerical-input {
        margin-bottom: 10px;
    }

    .b-reload__modal__buttons {
        flex-direction: row-reverse;
        padding: 0 10px 10px 10px;
        align-items: center;
        justify-content: space-between;

        & > button {
            padding: 10px 20px;
        }

        & > button > span {
            display: none;
        }
    }
}
</style>
