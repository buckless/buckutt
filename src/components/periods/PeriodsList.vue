<template>
    <div>
        <h5>Listes des périodes</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom de la période" v-model="name"></mdl-textfield>
        </div>

        <b-table
            :headers="[
                { title: 'Période', field: 'name', object: true },
                { title: 'Début', field: 'start', type: 'date' },
                { title: 'Fin', field: 'end', type: 'date'}
            ]"
            :data="displayedPeriods"
            :filter="{ val: this.name, field: 'name' }"
            :sort="{ field: 'end', order: 'DESC' }"
            :actions="[
                { action: 'edit', text: 'Modifier', raised: true, colored: true, condition: { field: 'id', statement: 'isNotIn', value: protectedPeriodsIds } },
                { action: 'remove', text: 'Supprimer', type: 'confirm', condition: { field: 'id', statement: 'isNotIn', value: protectedPeriodsIds } }
            ]"
            route="periods"
            :paging="10"
            @edit="editPeriod"
            @remove="removeObject">
        </b-table>
        <br />
        <mdl-button accent @click.native="displayOutdated = !displayOutdated">
            <template v-if="!displayOutdated">Afficher</template>
            <template v-else>Masquer</template>
            les anciennes périodes</mdl-button>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            name: '',
            displayOutdated: false
        };
    },

    methods: {
        ...mapActions(['removeObject']),

        editPeriod(period) {
            this.$router.push(`/periods/${period.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            periods: state => state.objects.periods
        }),

        ...mapGetters(['protectedPeriodsIds', 'currentPeriods']),

        displayedPeriods() {
            return this.displayOutdated ? this.periods : this.currentPeriods;
        }
    }
};
</script>
