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

            <form v-if="isCheckout" class="payment-form" method="POST" action="https://merchant.com/successUrl"></form>

            <p class="info">
                Vous serez redirigé vers un site bancaire <strong>sécurisé</strong>.<br />
                Les opérations en ligne ne sont validées qu'à la suite d'une transaction sur site.
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

let scriptsLoaded = false;
let counter = 0;

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
            working: 'working/working',
            user: 'user/user'
        })
    },

    methods: {
        ...mapActions({
            reloadAction: 'reload/reload'
        }),

        reload(amount) {
            if (reload.name === 'checkout') {
                // Dirty fix to avoid multiple callbacks to be called
                counter += 1;
                const currentCounter = counter;

                Checkout.configure({
                    publicKey: reload.checkout.publicKey,
                    customerEmail: this.user.mail,
                    value: parseInt(amount * 100, 10),
                    currency: 'EUR',
                    cardFormMode: 'cardTokenisation',
                    paymentMode: 'cards',
                    cardTokenised: event => {
                        if (currentCounter === counter) {
                            this.reloadAction({ amount, cardToken: event.data.cardToken });
                        }
                    }
                });
                Checkout.open();
            } else {
                this.reloadAction({ amount });
            }
        }
    },

    mounted() {
        if (!scriptsLoaded && reload.name === 'checkout') {
            const checkoutScript = document.createElement('script');
            checkoutScript.setAttribute('src', reload.checkout.scriptLocation);
            checkoutScript.setAttribute('async', true);
            document.head.appendChild(checkoutScript);
            scriptsLoaded = true;
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
