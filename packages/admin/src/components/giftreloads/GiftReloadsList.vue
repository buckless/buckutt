<template>
    <div>
        <h5>Liste des offres de rechargement</h5>

        <b-table
            :headers="[
                { title: 'Montant offert', field: 'amount', type: 'price' },
                { title: 'Tous les', field: 'everyAmount', type: 'price' },
                { title: 'Montant minimal', field: 'minimalAmount', type: 'price' }
            ]"
            :data="giftreloads"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier' },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="giftreloads"
            :paging="10"
            @edit="editGiftReload"
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

        editGiftReload(giftReload) {
            this.$router.push(`/giftreloads/${giftReload.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            giftreloads: state => state.objects.giftreloads
        })
    }
};
</script>
