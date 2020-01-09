<template>
    <div class="home-hero">
        <div class="intro-desktop">
            <i18n path="views.home.hero.title" tag="h2" class="title">
                <Wave width="24" height="24" />
                <template>{{ credit }}</template>
            </i18n>
            <p class="synchro">
                {{ $t('views.home.hero.pending') }} {{ pendingCredit }}
                <Icon name="hourglass_empty" :size="16" />
            </p>
        </div>
        <div class="intro-mobile">
            <i18n path="views.home.hero.hello" tag="h2" class="title">
                <Wave width="24" height="24" />
            </i18n>
            <p class="credit">{{ $t('views.home.hero.balance') }} {{ credit }}</p>
            <p class="synchro">{{ $t('views.home.hero.pendingMobile') }} {{ pendingCredit }}</p>
        </div>

        <template v-if="isRefundOpened">
            <p class="refund">{{ $t('views.home.hero.refund.title') }}</p>

            <div class="infos" v-if="activeWallet.refunds.alreadyAsked">
                <i18n path="views.home.hero.refund.already" tag="span">
                    <strong>{{ refundData.refundedAmount }}</strong>
                    <strong>{{ refundData.dateAsked }}</strong>
                </i18n>
                <br />
                {{ $t('views.home.hero.refund.week') }}
            </div>
            <i18n
                path="views.home.hero.refund.tooLow"
                tag="div"
                class="infos"
                v-else-if="isCreditTooLow"
            >
                <strong>{{ refundData.minimum }}</strong>
            </i18n>
            <template v-else-if="!activeWallet.refunds.cardRegistered">
                <div class="buttons">
                    <Button raised @click="cardRegister">{{
                        $t('views.home.hero.refund.register')
                    }}</Button>
                </div>

                <div class="infos">
                    {{ $t('views.home.hero.refund.description') }}<br />
                    {{ $t('views.home.hero.refund.secure') }}
                </div>
            </template>
            <template v-else>
                <div class="buttons">
                    <Button raised accent @click="refund">{{
                        $t('views.home.hero.refund.ask')
                    }}</Button>
                    <Button raised @click="cardRegister">{{
                        $t('views.home.hero.refund.another')
                    }}</Button>
                </div>

                <div class="infos">
                    {{ $t('views.home.hero.refund.lastCard') }}<br />
                    <i18n
                        v-if="
                            paymentCosts.fixedCostsRefund > 0 ||
                                paymentCosts.variableCostsRefund > 0
                        "
                        path="views.home.hero.refund.costs"
                        tag="span"
                    >
                        <template
                            v-if="
                                paymentCosts.fixedCostsRefund > 0 &&
                                    !paymentCosts.variableCostsRefund
                            "
                        >
                            <strong>{{ format(paymentCosts.fixedCostsRefund) }}</strong>
                        </template>
                        <template
                            v-else-if="
                                !paymentCosts.fixedCostsRefund &&
                                    paymentCosts.variableCostsRefund > 0
                            "
                        >
                            <strong>{{ paymentCosts.variableCostsRefund }}%</strong>
                        </template>
                        <template
                            v-else-if="
                                paymentCosts.fixedCostsRefund > 0 &&
                                    paymentCosts.variableCostsRefund > 0
                            "
                        >
                            <strong>{{ format(paymentCosts.fixedCostsRefund) }}</strong>
                            {{ $t('views.home.hero.refund.and') }}
                            <strong>{{ paymentCosts.variableCostsRefund }}%</strong>
                        </template>
                    </i18n>
                </div>
            </template>
        </template>
        <template v-else-if="isReloadAllowed">
            <p class="reload">{{ $t('views.home.hero.reload.title') }}</p>

            <div class="buttons" v-show="customAmount === '0'">
                <Button raised accent @click="reload({ amount: 1000 })">10€</Button>
                <Button raised accent @click="reload({ amount: 2000 })">20€</Button>
                <Button raised accent @click="reload({ amount: 4000 })">40€</Button>
                <Button accent @click="toggleCustomAmount">{{
                    $t('views.home.hero.reload.other')
                }}</Button>
            </div>

            <form
                class="custom-amount"
                @submit.prevent="handleSubmit"
                v-show="customAmount !== '0'"
            >
                <Input
                    type="text"
                    suffix="€"
                    v-model="customAmount"
                    ref="customAmout"
                    @blur="validate"
                    :invalid="Boolean(errors.customAmount)"
                />
                <Button raised accent>{{ $t('common.validate') }}</Button>
            </form>

            <div class="infos">
                <template v-if="giftReloads && giftReloads.length > 0">
                    <i18n
                        path="views.home.hero.reload.gift"
                        tag="div"
                        v-for="(giftReload, i) in giftReloads"
                        :key="i"
                    >
                        <strong>{{ format(giftReload.everyAmount) }}</strong>
                        <strong>{{ format(giftReload.amount) }}</strong>
                        <template v-if="giftReload.amount > 100">{{
                            $t('views.home.hero.reload.additionalPlural')
                        }}</template>
                        <template v-else>{{
                            $t('views.home.hero.reload.additionalSingle')
                        }}</template>
                    </i18n>
                </template>
                <i18n
                    v-if="paymentCosts.fixedCostsReload > 0 || paymentCosts.variableCostsReload > 0"
                    path="views.home.hero.reload.costs"
                    tag="span"
                >
                    <template
                        v-if="
                            paymentCosts.fixedCostsReload > 0 && !paymentCosts.variableCostsReload
                        "
                    >
                        <strong>{{ format(paymentCosts.fixedCostsReload) }}</strong>
                    </template>
                    <template
                        v-else-if="
                            !paymentCosts.fixedCostsReload && paymentCosts.variableCostsReload > 0
                        "
                    >
                        <strong>{{ paymentCosts.variableCostsReload }}%</strong>
                    </template>
                    <template
                        v-else-if="
                            paymentCosts.fixedCostsReload > 0 &&
                                paymentCosts.variableCostsReload > 0
                        "
                    >
                        <strong>{{ format(paymentCosts.fixedCostsReload) }}</strong>
                        {{ $t('views.home.hero.reload.and') }}
                        <strong>{{ paymentCosts.variableCostsReload }}%</strong>
                    </template>
                </i18n>
            </div>
        </template>
        <p v-else>{{ $t('views.home.hero.deactivated') }}</p>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Icon from 'ui/src/components/Icon/Icon';
import Input from 'ui/src/components/Input/Input';
import Button from 'ui/src/components/Button/Button';
import Wave from '../../components/wave/Wave';

import { buildValidation } from '../../utils/formValidation';
import { format } from '../../utils/money';

import { validateCustomAmountForm } from './validate';

export default {
    components: {
        Icon,
        Input,
        Button,
        Wave
    },

    data: () => ({
        customAmount: '0',
        errors: {}
    }),

    computed: {
        ...mapGetters({
            activeWallet: 'wallet/getActiveWallet',
            isReloadAllowed: 'infos/getIsReloadAllowed',
            giftReloads: 'infos/getGiftReloads',
            paymentCosts: 'infos/getPaymentCosts',
            pending: 'history/getPending'
        }),

        credit() {
            if (!this.activeWallet) {
                return '';
            }

            return format({ amount: this.activeWallet.credit });
        },

        pendingCredit() {
            const symbol = this.pending > 0 ? '+' : '';

            return symbol + format({ amount: this.pending });
        },

        isRefundOpened() {
            if (!this.activeWallet) {
                return false;
            }

            const now = new Date();

            return (
                new Date(this.activeWallet.refunds.start) <= now &&
                new Date(this.activeWallet.refunds.end) >= now
            );
        },

        isCreditTooLow() {
            if (!this.activeWallet) {
                return;
            }

            return this.activeWallet.refunds.refundable < this.activeWallet.refunds.minimum;
        },

        refundData() {
            if (!this.activeWallet) {
                return;
            }

            return {
                minimum: format({ amount: this.activeWallet.refunds.minimum }),
                dateAsked: this.activeWallet.refunds.alreadyAsked
                    ? this.$d(new Date(this.activeWallet.refunds.alreadyAsked.date), 'long')
                    : null,
                refundedAmount: this.activeWallet.refunds.alreadyAsked
                    ? format({ amount: this.activeWallet.refunds.alreadyAsked.amount })
                    : null
            };
        }
    },

    methods: {
        ...mapActions({
            reload: 'reload/reload',
            cardRegister: 'refund/cardRegister',
            refund: 'refund/refund'
        }),

        toggleCustomAmount() {
            this.customAmount = '40';

            this.$nextTick(() => {
                this.$refs.customAmout.$el.querySelector('input').focus();
            });
        },

        validate: buildValidation(['customAmount'], validateCustomAmountForm),

        handleSubmit() {
            if (!this.validate()) {
                return;
            }

            this.reload({ amount: parseInt(this.customAmount, 10) * 100 });
        },

        format(value) {
            return format({ amount: value });
        }
    }
};
</script>

<style scoped>
.home-hero {
    padding: 60px;
}

.intro-mobile {
    display: none;
}

.title {
    margin: 0;
    font-size: var(--typography-h3-size);
    letter-spacing: var(--typography-h3-spacing);
    font-weight: 400;
}

.synchro {
    display: flex;
    align-items: center;
}

.synchro .icon {
    margin-left: 4px;
}

.reload,
.refund {
    font-size: var(--typography-body-1-size);
    letter-spacing: var(--typography-body-1-spacing);
    font-weight: var(--typography-button-weight);
}

.buttons > :not(:last-child) {
    margin-right: 16px;
}

.custom-amount {
    display: flex;
}

.custom-amount > .button {
    margin-left: 16px;
}

.infos {
    margin-top: 1rem;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .home-hero {
        padding: 20px;
    }

    .intro-desktop {
        display: none;
    }

    .intro-mobile {
        display: block;
    }

    .title {
        font-size: 18px;
    }

    .credit {
        margin-bottom: 0;
    }

    .synchro {
        margin-top: 0;
        font-size: 14px;
    }

    .buttons .button[raised]:not(:nth-of-type(2)) {
        display: none;
    }
}
</style>
