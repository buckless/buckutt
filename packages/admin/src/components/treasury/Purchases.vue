<template>
    <div class="b-container-content">
        <div class="b-container-content-text">
            <b-objecttitle icon="shopping_cart" title="Achats"></b-objecttitle>

            <b-pagination :rows="displayedRows" v-slot="{ rows }">
                <b-table :rows="rows" />
            </b-pagination>

            <div class="b-treasury-actions">
                <b-button raised @click="download">Exporter</b-button>
                <div class="b--flexspacer"></div>
                <h6>Total: {{ totalSell | price(true) }}</h6>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ObjectTitle from '../base/object/ObjectTitle.vue';
import { parsePrice } from '@/lib/price';
import sortOrder from '@/lib/sortOrder';

export default {
    components: {
        'b-objecttitle': ObjectTitle
    },

    props: {
        fields: Object
    },

    computed: {
        ...mapGetters(['getApiObjects']),

        purchases() {
            return this.getApiObjects('purchases');
        },

        displayedRows() {
            return this.purchases
                .slice()
                .sort(
                    (a, b) =>
                        sortOrder(a.name, b.name) || sortOrder(a.isCancellation, b.isCancellation)
                )
                .map(purchase => ({
                    id: purchase.id,
                    icon: purchase.isCancellation ? 'remove_shopping_cart' : 'shopping_cart',
                    title: purchase.isCancellation
                        ? `Annulation ${purchase.name} x ${purchase.count}`
                        : `${purchase.name} x ${purchase.count}`,
                    subtitle: `Prix unitaire: ${parsePrice(purchase.price, true)}`,
                    right: purchase.isCancellation
                        ? `-${parsePrice(purchase.totalTI, true)}`
                        : `+${parsePrice(purchase.totalTI, true)}`
                }));
        },

        totalSell() {
            return this.purchases
                .map(purchase =>
                    purchase.isCancellation
                        ? -1 * parseInt(purchase.totalTI, 10)
                        : parseInt(purchase.totalTI, 10)
                )
                .reduce((a, b) => a + b, 0);
        }
    },

    methods: {
        ...mapActions(['downloadTreasury']),

        download() {
            this.downloadTreasury({ fields: this.fields, route: 'purchases' });
        }
    }
};
</script>

<style>
.b-container-content {
    flex: 1;
    padding: 20px;

    & > .b-container-content-text {
        max-width: 870px;
        margin: 0 auto;
    }

    & h6 {
        font-size: var(--typography-h6-size);
        letter-spacing: var(--typography-h6-spacing);
        font-weight: var(--typography-h6-weight);
    }
}

.b-treasury-actions {
    display: flex;
    align-items: center;
    margin-top: 15px;
}
</style>
