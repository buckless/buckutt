<template>
    <div class="history">
        <Table :headers="headers" :data="history" :paging="10" />
        <Button to="/dashboard/invoice">Imprimer un reçu</Button>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Table from '@/components/Table';
import Button from '@/components/Button';

export default {
    name: 'DashboardHistory',

    components: {
        Table,
        Button
    },

    data: () => {
        const data = {
            headers: [
                { title: 'Date', field: 'date', type: 'date' },
                { title: 'Point', field: 'point', type: 'plain' },
                { title: 'Objet', field: 'object', list: 'articles' },
                {
                    title: 'Valeur',
                    field: 'amount',
                    type: 'price',
                    class: 'numeric-cell'
                }
            ]
        };

        if (process.env.VUE_APP_HISTORY_SHOW_TYPE === '1') {
            data.headers.splice(1, 0, { title: 'Type', field: 'type' });
        }

        if (process.env.VUE_APP_HISTORY_SHOW_OPERATOR === '1') {
            data.headers.splice(-1, 0, {
                title: 'Opérateur',
                field: 'operator',
                class: 'capitalized'
            });
        }

        return data;
    },

    computed: {
        ...mapGetters({
            history: 'history/history'
        })
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
