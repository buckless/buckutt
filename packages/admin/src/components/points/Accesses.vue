<template>
    <div class="b-accesses-table">
        <b-pagination :rows="displayedAccesses" v-slot="{ rows }">
            <b-table :rows="rows" />
        </b-pagination>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { parseDate } from '@/lib/date';
import sortOrder from '@/lib/sortOrder';

export default {
    computed: {
        ...mapGetters(['focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
        },

        displayedAccesses() {
            let pointAccesses = [];

            this.focusedElement.wikets.forEach(wiket => {
                pointAccesses = pointAccesses.concat(wiket.accesses);
            });

            return pointAccesses
                .sort((a, b) => sortOrder(a, b, 'DESC'))
                .map(access => ({
                    id: access.id,
                    icon: 'security',
                    title: access.wallet.user
                        ? `${access.wallet.user.firstname} ${
                              access.wallet.user.lastname
                          } (support ${access.wallet.physical_id})`
                        : access.wallet.physical_id,
                    subtitle: `Date: ${parseDate(access.clientTime)}`
                }));
        }
    }
};
</script>

<style>
.b-accesses-table {
    margin: 15px 0;
}
</style>
