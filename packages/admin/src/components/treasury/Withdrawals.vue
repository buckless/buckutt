<template>
    <div class="b-container-content">
        <div class="b-container-content-text">
            <b-objecttitle icon="kitchen" title="Catering"></b-objecttitle>

            <b-pagination :rows="displayedRows" v-slot="{ rows }">
                <b-table :rows="rows" />
            </b-pagination>

            <div class="b-treasury-actions">
                <b-button raised @click="download">Exporter la liste détaillée</b-button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ObjectTitle from '../base/object/ObjectTitle.vue';
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

        withdrawals() {
            return this.getApiObjects('withdrawals');
        },

        displayedRows() {
            return this.withdrawals
                .slice()
                .sort(
                    (a, b) =>
                        sortOrder(a.name, b.name) || sortOrder(a.isCancellation, b.isCancellation)
                )
                .map(withdrawal => ({
                    id: withdrawal.id,
                    icon: withdrawal.isCancellation ? 'remove_shopping_cart' : 'shopping_cart',
                    title: withdrawal.isCancellation
                        ? `Annulation ${withdrawal.name} x ${withdrawal.count}`
                        : `${withdrawal.name} x ${withdrawal.count}`
                }));
        }
    },

    methods: {
        ...mapActions(['downloadTreasury']),

        download() {
            this.downloadTreasury({ fields: this.fields, route: 'withdrawals' });
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
