<template>
    <div class="b-transactions">
        <b-pagination :rows="displayedTransactions" v-slot="{ rows }">
            <b-table :rows="rows" />
        </b-pagination>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import sortOrder from '@/lib/sortOrder';
import { parsePrice } from '@/lib/price';
import { parseDate } from '@/lib/date';

export default {
    computed: {
        ...mapGetters(['focusedElements']),

        transactions() {
            return this.focusedElements[0].transactions
                .slice()
                .sort((a, b) => sortOrder(a.created_at, b.created_at, 'DESC'));
        },

        displayedTransactions() {
            if (!this.transactions) {
                return [];
            }

            return this.transactions.map(transaction => ({
                icon: 'credit_card',
                right: !transaction.isAuthorization
                    ? `+${parsePrice(transaction.amount, true)}`
                    : '',
                id: transaction.id,
                title: transaction.isAuthorization ? 'Enregistrement CB' : 'Transaction CB',
                subtitle: `Date: ${parseDate(transaction.created_at)} • État: ${this.translateState(
                    transaction.state
                )}`
            }));
        }
    },

    methods: {
        translateState(state) {
            switch (state) {
                case 'pending':
                    return 'En cours de traitement';
                case 'ACCEPTED':
                    return 'Paiement accepté';
                case 'CANCELLED':
                    return 'Paiement annulé';
                case 'REFUSED':
                    return 'Paiement refusé';
                default:
                    return 'Erreur';
            }
        }
    }
};
</script>
