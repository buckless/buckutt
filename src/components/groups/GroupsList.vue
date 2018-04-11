<template>
    <div>
        <h5>Liste des groupes</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom du groupe" v-model="name"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Groupe', field: 'name', object: true }]"
            :data="groups"
            :filter="{ val: this.name, field: 'name' }"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier', raised: true, colored: true, condition: { field: 'id', statement: 'isNot', value: event.defaultGroup_id } },
                { action: 'remove', text: 'Supprimer', type: 'confirm', condition: { field: 'id', statement: 'isNot', value: event.defaultGroup_id } }
            ]"
            route="groups"
            :paging="10"
            @edit="editGroup"
            @remove="removeObject">
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

        editGroup(group) {
            this.$router.push(`/groups/${group.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            groups: state => state.objects.groups
        }),

        ...mapGetters(['event'])
    }
};
</script>
