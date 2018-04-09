<template>
    <div>
        <h5>Liste des guichets</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom du guichet" v-model="name"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Guichet', field: 'name', object: true }]"
            :data="points"
            :filter="{ val: this.name, field: 'name' }"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier' },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="points"
            :paging="10"
            @edit="editPoint"
            @remove="removeObject">
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            name: ''
        };
    },

    methods: {
        ...mapActions(['removeObject']),

        editPoint(point) {
            this.$router.push(`/points/${point.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            points: state => state.objects.points.filter(point => point.name !== 'Internet')
        })
    }
};
</script>
