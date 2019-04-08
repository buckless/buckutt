<template>
    <div class="history">
        <Table :headers="headers" :data="history" :paging="10" />
        <Button to="/dashboard/invoice" v-if="showInvoice">{{
            $t('dashboard.history.invoice')
        }}</Button>
    </div>
</template>

<script>
import { history } from 'config/manager';
import { mapGetters } from 'vuex';
import Table from '@/components/Table';
import Button from '@/components/Button';

export default {
    name: 'DashboardHistory',

    components: {
        Table,
        Button
    },

    data: () => ({
        showInvoice: history.showInvoice
    }),

    computed: {
        ...mapGetters({
            history: 'history/history'
        }),

        headers() {
            let headers = [
                { title: this.$t('dashboard.history.date'), field: 'date', type: 'date' },
                { title: this.$t('dashboard.history.location'), field: 'point', type: 'plain' },
                { title: this.$t('dashboard.history.object'), field: 'object', list: 'articles' },
                {
                    title: this.$t('dashboard.history.amount'),
                    field: 'amount',
                    type: 'price',
                    class: 'numeric-cell'
                }
            ];

            if (history.showType) {
                headers.splice(1, 0, { title: this.$t('dashboard.history.type'), field: 'type' });
            }

            if (history.showOperator) {
                headers.splice(-1, 0, {
                    title: this.$t('dashboard.history.operator'),
                    field: 'operator',
                    class: 'capitalized'
                });
            }

            return headers;
        }
    }
};
</script>

<style lang="scss" scoped>
.history {
    padding: 1rem;
    max-width: 100% !important;
    width: 100%;
}
</style>
