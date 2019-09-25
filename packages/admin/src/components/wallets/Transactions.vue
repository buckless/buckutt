<template>
    <div class="b-transactions">
        <b-pagination :rows="displayedHistory" v-slot="{ rows }">
            <b-table :rows="rows" @action="startCancel" />
        </b-pagination>

        <div class="b-transactions-actions">
            <h6>
                Crédit: {{ focusedWallet.credit | price(true) }} ({{ pending | price(true) }} en
                attente)
            </h6>
            <div class="b--flexspacer"></div>
            <b-button :to="`/wallets/${focusedWallet.id}/transactions/refund`">Rembourser</b-button>
        </div>

        <b-confirm ref="confirm" @confirm="cancel"></b-confirm>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { parsePrice } from '@/lib/price';
import { parseDate } from '@/lib/date';

const icons = {
    transfer: 'transform',
    reload: 'attach_money',
    'reload-cancellation': 'money_off',
    refund: 'money_off',
    'refund-cancellation': 'attach_money',
    purchase: 'shopping_cart',
    'purchase-cancellation': 'remove_shopping_cart',
    promotion: 'shopping_cart',
    'promotion-cancellation': 'remove_shopping_cart',
    withdrawal: 'shopping_cart'
};

export default {
    data: () => ({
        transactionId: '',
        pending: 0
    }),

    computed: {
        ...mapState({
            history: state => state.app.history,
            meansofpayment: state =>
                state.api.meansofpayment.allIds.map(id => state.api.meansofpayment.values[id])
        }),

        ...mapGetters(['focusedElements']),

        focusedWallet() {
            return this.focusedElements[0];
        },

        displayedHistory() {
            if (!this.history) {
                return [];
            }

            return this.history.map(transaction => {
                const rawType = transaction.type.replace('-cancellation', '');

                const displayedTransaction = {
                    icon: icons[transaction.type],
                    right:
                        transaction.amount <= 0
                            ? parsePrice(transaction.amount, true)
                            : `+${parsePrice(transaction.amount, true)}`,
                    rightIcon:
                        ['transfer', 'withdrawal'].indexOf(rawType) > -1 ? undefined : 'delete',
                    id: transaction.id,
                    title: this.translation(transaction.type),
                    subtitle: `Date: ${parseDate(transaction.date)} • Guichet: ${
                        transaction.point
                    }`,
                    rawType
                };

                switch (rawType) {
                    case 'transfer':
                        displayedTransaction.title += `avec ${transaction.seller.firstname} ${
                            transaction.seller.lastname
                        }`;
                        break;
                    case 'reload':
                        displayedTransaction.title += ` ${this.translateMop(transaction.mop)}`;
                        break;
                    case 'refund':
                        displayedTransaction.title += ` ${this.translateMop(transaction.mop)}`;
                        break;
                    case 'purchase':
                        displayedTransaction.title += ` ${transaction.articles[0]}`;
                        break;
                    case 'promotion':
                        displayedTransaction.title += ` ${transaction.promotion}`;
                        displayedTransaction.subtitle += ` • Contenu: ${transaction.articles.join(
                            ', '
                        )}`;
                        break;
                    case 'withdrawal':
                        displayedTransaction.title += ` ${transaction.articles[0]}`;
                        break;
                    default:
                        break;
                }

                return displayedTransaction;
            });
        }
    },

    methods: {
        ...mapActions(['loadWalletHistory', 'cancelTransaction', 'notify']),

        translation(type) {
            const splittedType = type.split('-');
            const translateTable = {
                refund: 'Remboursement',
                promotion: 'Achat',
                purchase: 'Achat',
                reload: 'Rechargement',
                transfer: 'Virement',
                withdrawal: 'Catering'
            };

            return splittedType[1]
                ? `Annulation ${translateTable[splittedType[0]]}`
                : translateTable[splittedType[0]];
        },

        translateMop(mop) {
            const translation = this.meansofpayment.find(m => m.slug === mop);

            return translation ? translation.name : mop;
        },

        startCancel(transactionId) {
            this.transactionId = transactionId;
            this.$refs.confirm.opened = true;
        },

        async cancel() {
            try {
                const transaction = this.displayedHistory.find(tr => tr.id === this.transactionId);
                await this.cancelTransaction({ transaction, wallet: this.focusedWallet });
                this.loadWalletHistory(this.focusedWallet);
            } catch (err) {
                console.log(err);
                switch (err.message) {
                    case 'Forbidden':
                        this.notify("Le support n'a pas assez de crédit");
                        break;
                    default:
                        this.notify('Erreur inconnue');
                }
            }
        }
    },

    async mounted() {
        const { pending } = await this.loadWalletHistory(this.focusedWallet);
        this.pending = pending;
    }
};
</script>

<style scoped>
.b-transactions-actions {
    display: flex;
    align-items: center;
    margin-top: 15px;

    & > h6 {
        margin: 0;
    }
}
</style>
