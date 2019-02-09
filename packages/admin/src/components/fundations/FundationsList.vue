<template>
    <div>
        <h5>Liste des fondations</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom de la fondation" v-model="name"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Fondation', field: 'name', object: true }]"
            :data="fundations"
            :filter="{ val: this.name, field: 'name' }"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                {
                    action: 'edit',
                    text: 'Modifier',
                    condition: { field: 'id', statement: 'isNot', value: event.defaultFundation_id }
                },
                {
                    action: 'remove',
                    text: 'Supprimer',
                    type: 'confirm',
                    condition: { field: 'id', statement: 'isNot', value: event.defaultFundation_id }
                }
            ]"
            route="fundations"
            :paging="10"
            @edit="editFundation"
            @remove="removeObject"
        >
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            name: ''
        };
    },

    methods: {
        ...mapActions(['removeObject']),

        editFundation(fundation) {
            this.$router.push(`/fundations/${fundation.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            fundations: state => state.objects.fundations
        }),

        ...mapGetters(['event'])
    }
};
</script>
