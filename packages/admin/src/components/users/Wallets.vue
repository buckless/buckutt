<template>
    <div class="b-wallets">
        <b-pagination :rows="displayedWallets" v-slot="{ rows }">
            <b-table :rows="rows" @click="toogleWallet" />
        </b-pagination>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { parsePrice } from '@/lib/price';

export default {
    computed: {
        ...mapGetters(['focusedElements']),

        displayedWallets() {
            const wallets = this.focusedElements[0].wallets;

            if (!wallets) {
                return [];
            }

            return wallets.map(wallet => ({
                icon: 'account_balance_wallet',
                id: wallet.id,
                title: this.walletName(wallet.logical_id, wallet.physical_id),
                subtitle: (!wallet.logical_id && !wallet.physical_id) ? 'Préchargement non lié à une puce' : '',
                right: parsePrice(wallet.credit, true)
            }));
        }
    },

    methods: {
        walletName(logicalId, physicalId) {
            if (physicalId) {
                return physicalId;
            } else if (logicalId) {
                return logicalId;
            }

            return 'Préchargement';
        },

        toogleWallet(id) {
            const wallet = this.focusedElements[0].wallets.find(wallet => wallet.id === id);

            if (wallet.physical_id || wallet.logical_id) {
                this.$router.push(`/wallets/${id}`);
            }
        }
    }
};
</script>
