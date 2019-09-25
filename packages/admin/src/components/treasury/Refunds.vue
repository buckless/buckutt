<template>
    <div class="b-container-content">
        <div class="b-container-content-text">
            <b-objecttitle icon="money_off" title="Remboursements"></b-objecttitle>

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

        refunds() {
            return this.getApiObjects('refunds');
        },

        meansofpayment() {
            return this.getApiObjects('meansofpayment');
        },

        displayedRows() {
            return this.refunds
                .slice()
                .sort(
                    (a, b) =>
                        sortOrder(a.type, b.type) || sortOrder(a.isCancellation, b.isCancellation)
                )
                .map(refund => ({
                    id: refund.id,
                    icon: refund.isCancellation ? 'attach_money' : 'money_off',
                    title: refund.isCancellation
                        ? `Annulation ${this.slugToName(refund.type)}`
                        : `${this.slugToName(refund.type)}`,
                    right: refund.isCancellation
                        ? `-${parsePrice(refund.amount, true)}`
                        : `+${parsePrice(refund.amount, true)}`
                }));
        },

        totalSell() {
            return this.refunds
                .map(refund =>
                    refund.isCancellation
                        ? -1 * parseInt(refund.amount, 10)
                        : parseInt(refund.amount, 10)
                )
                .reduce((a, b) => a + b, 0);
        }
    },

    methods: {
        ...mapActions(['downloadTreasury']),

        download() {
            this.downloadTreasury({ fields: this.fields, route: 'refunds' });
        },

        slugToName(slug) {
            const index = this.meansofpayment.findIndex(mop => mop.slug === slug);

            return index !== -1 ? this.meansofpayment[index].name : slug;
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
}

.b-treasury-actions {
    display: flex;
    margin-top: 15px;
}
</style>
