<template>
    <div>
        <h5>Liste des moyens de paiement</h5>

        <b-table
            :headers="[{ title: 'Nom', field: 'name', object: true }]"
            :data="meansofpayment"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                {
                    action: 'edit',
                    text: 'Modifier',
                    condition: { field: 'slug', statement: 'isNotIn', value: ['card', 'cash'] }
                },
                {
                    action: 'remove',
                    text: 'Supprimer',
                    type: 'confirm',
                    condition: { field: 'slug', statement: 'isNotIn', value: ['card', 'cash'] }
                }
            ]"
            route="meansofpayment"
            :paging="10"
            @edit="editMeanOfPayment"
            @remove="removeObject"
        >
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['removeObject']),

        editMeanOfPayment(meanOfPayment) {
            this.$router.push(`/meansofpayment/${meanOfPayment.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            meansofpayment: state => state.objects.meansofpayment
        })
    }
};
</script>
