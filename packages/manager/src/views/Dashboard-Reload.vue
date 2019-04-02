<template>
    <div class="reload">
        <Card>
            <div>
                Mon solde :
            </div>
            <div class="credit">
                <span class="actual">{{ (credit / 100) | currency }}</span>
                <span class="pending">
                    <Icon name="access_time" /> {{ (pending / 100) | currency }} en attente
                </span>
            </div>
            <p class="info">
                Les opérations peuvent prendre plusieurs minutes avant d'être synchronisée sur cet
                espace cashless. Les transactions en lignes seront marquées « en attente » jusqu'à
                une opération réalisée sur place.
            </p>
        </Card>
        <div class="reload-buttons">
            <h3>Rechargement</h3>
            <div v-if="buttonsInputs" class="amounts">
                <Button :disabled="working" small raised class="amount" @click="reload(10)"
                    >10€</Button
                >
                <Button :disabled="working" small raised class="amount" @click="reload(20)"
                    >20€</Button
                >
                <Button :disabled="working" small raised class="amount" @click="reload(30)"
                    >30€</Button
                >
                <Button :disabled="working" small raised class="amount" @click="reload(40)"
                    >40€</Button
                >
                <Button
                    :disabled="working"
                    small
                    raised
                    class="amount"
                    @click="buttonsInputs = false"
                    >...</Button
                >
            </div>
            <form v-else :custom="!buttonsInputs" class="amounts" @submit.prevent="reload(amount)">
                <TextInput
                    v-model="amount"
                    :disabled="working"
                    type="number"
                    label="Montant personnalisé"
                    autofocus
                />
                <Button raised>Valider</Button>
            </form>

            <form v-if="isCheckout" class="payment-form" method="POST"></form>

            <p class="info">
                Vous serez redirigé vers un site bancaire <strong>sécurisé</strong>.<br />
                Les opérations en ligne ne sont validées qu'à la suite d'une transaction sur site.<br />
                <template v-if="costs.fixedCostsReload > 0 && costs.variableCostsReload > 0">
                    Des frais bancaires d'une valeur de <strong>{{ (costs.fixedCostsReload / 100) | currency }}</strong> + <strong>{{ costs.variableCostsReload }}%</strong> du montant de la transaction seront appliqués.
                </template>
                <template v-else-if="costs.fixedCostsReload > 0">
                    Des frais bancaires d'une valeur de <strong>{{ (costs.fixedCostsReload / 100) | currency }}</strong> seront appliqués.
                </template>
                <template v-else-if="costs.variableCostsReload > 0">
                    Des frais bancaires d'une valeur de <strong>{{ costs.variableCostsReload }}%</strong> du montant de la transaction seront appliqués.
                </template>
            </p>
            <div v-if="giftReloads && giftReloads.length > 0" class="gifts">
                <div v-for="(giftReload, i) in giftReloads" :key="i" class="gift">
                    Tous les <span>{{ (giftReload.everyAmount / 100) | currency }}</span
                    >, recevez
                    <strong>{{ (giftReload.amount / 100) | currency }}</strong>
                    supplémentaire<template v-if="giftReload.amount > 100"
                        >s</template
                    >.
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { reload } from 'config/manager';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';

export default {
    name: 'DashboardReload',

    components: {
        Card,
        Icon,
        Button,
        TextInput
    },

    data: () => ({
        buttonsInputs: true,
        amount: '10',
        isCheckout: reload.name === 'checkout'
    }),

    computed: {
        ...mapGetters({
            credit: 'user/credit',
            pending: 'history/pending',
            giftReloads: 'user/giftReloads',
            costs: 'user/costs',
            working: 'working/working',
            user: 'user/user'
        })
    },

    methods: {
        ...mapActions({
            reloadAction: 'reload/reload'
        }),

        reload(amount) {
            const intAmount = parseInt(amount, 10);
            const fullAmount = intAmount * (1 + (this.costs.variableCostsReload / 100)) + (this.costs.fixedCostsReload / 100);

            if (reload.name === 'checkout') {
                Checkout.configure({
                    publicKey: reload.checkout.publicKey,
                    customerEmail: this.user.mail,
                    value: fullAmount * 100,
                    currency: 'EUR',
                    cardFormMode: 'cardTokenisation',
                    paymentMode: 'cards'
                });

                Checkout.addEventHandler(Checkout.Events.CARD_TOKENISED, event => {
                    this.reloadAction({ amount: fullAmount, cardToken: event.data.cardToken });
                });

                Checkout.addEventHandler(Checkout.Events.LIGHTBOX_DEACTIVATED, () => {
                    Checkout.removeAllEventHandlers(Checkout.Events.CARD_TOKENISED);
                    Checkout.removeAllEventHandlers(Checkout.Events.LIGHTBOX_DEACTIVATED);
                });

                Checkout.open();
            } else {
                this.reloadAction({ amount: fullAmount });
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.reload {
    padding: 1rem 0;
}

.info {
    font-size: 0.9rem;
    margin-top: 0.75rem;
    margin-bottom: 0;
}

.credit {
    display: flex;
    align-items: center;
    margin-top: 0.75rem;
}

.credit .actual {
    font-size: 1.5rem;
    font-weight: 500;
}

.credit .pending {
    display: inline-flex;
    align-items: center;
    margin-left: 1.5rem;
}

.credit .pending > :first-child {
    margin-right: 0.25rem;
}

.reload-buttons {
    margin: 1rem;
}

.amounts {
    display: flex;
    align-items: flex-end;
}

.amounts[custom] > :last-child {
    margin-left: 1rem;
}

.amounts > .input {
    margin-left: 1rem;
}

.amount {
    &:not(:last-child) {
        margin-right: 0.75rem;
    }
}

.gifts {
    margin-top: 1rem;
    font-size: 0.9rem;
}
</style>
