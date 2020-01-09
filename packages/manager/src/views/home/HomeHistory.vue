<template>
    <div class="history">
        <Pagination :rows="allRows" :locale="$i18n.locale">
            <template v-slot="{ rows }">
                <Table :rows="rows" @click="alert" @action="action" />
            </template>
        </Pagination>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Table from 'ui/src/components/Table/Table';
import Pagination from 'ui/src/components/Pagination/Pagination';

import { historyEntryToTableRow } from './historyEntryToTableRow';

export default {
    components: {
        Table,
        Pagination
    },

    computed: {
        ...mapGetters({
            history: 'history/getHistory',
            meansOfPayment: 'infos/getMeansOfPayment'
        }),

        allRows() {
            return this.history.map(row => historyEntryToTableRow(row, this.meansOfPayment));
        }
    },

    methods: {
        alert() {},

        action() {}
    }
};
</script>

<style scoped>
.history {
    max-width: calc(475px * 2 + 24px);
}
</style>
