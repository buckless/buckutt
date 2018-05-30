<template>
    <div
        v-if="reloadState !== 'closed' || reloadOnly"
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
                    <numerical-input
                        @changed="updateCurrency"
                        @validate="confirmReloadModal"
                        ref="input"></numerical-input>
                </div>
            </div>
            <div
                class="b-reload__modal__buttons"
                v-show="reloadState === 'confirm'">
                <button @click="reload">Paiement accepté</button>
                <button @click="cancelReloadModal">Paiement refusé</button>
            </div>
        </div>
        <nfc mode="read" @read="validate" v-if="!loggedBuyer.isAuth && reloadOnly && isWaiting && !isWriting" key="read" />
        <nfc mode="write" @read="validate" @cancel="cancelReload" v-if="reloadOnly && isWriting" key="write"/>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import Currency from './Currency';
import Methods from './Reload-Methods';
import NumericalInput from './NumericalInput';

export default {
    props: {
        reloadOnly: { type: Boolean, required: false, default: false }
    },

    components: {
        Currency,
        Methods,
        NumericalInput
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
            giftReloads: state => state.items.giftReloads
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
                type: this.$store.state.reload.meanOfPayment,
                trace: ''
            });

            if (this.reloadGiftAmount) {
                this.addReload({
                    amount: this.reloadGiftAmount,
                    type: 'gift',
                    trace: `${this.$store.state.reload.meanOfPayment}-${this.reloadAmount}`
                });
            }

            let initialPromise = Promise.resolve();

            if (this.reloadOnly) {
                initialPromise = this.sendBasket();
            }

            initialPromise.then(() => this.closeReload());
        },

        validate(cardNumber, credit) {
            this.buyer({
                cardNumber,
                credit: Number.isInteger(credit) ? credit : null,
                isOnlyAuth: this.isWaiting && !this.isWriting
            });
        },

        cancelReload() {
            this.$store.commit('SET_WRITING', false);
            this.$store.commit('SET_BASKET_STATUS', 'WAITING');
        },

        ...mapActions([
            'confirmReloadModal',
            'closeReloadModal',
            'addReload',
            'removeReloads',
            'cancelReloadModal',
            'sendBasket',
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
    & .b-reload__modal {
        transform: translateX(-50%);
        transform-origin: top center;
        z-index: 3;
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
    padding: 0 40px 20px 40px;

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
            top: 90px;
            z-index: 3;

            &.b-reload__modal--fromtop {
                top: 150px;
            }
        }
    }

    .b-reload__modal {
        max-width: 310px;
    }

    .b-reload__modal__methods {
        flex-wrap: wrap;
        width: 100%;
    }
}
</style>
