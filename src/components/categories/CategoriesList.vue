<template>
    <div>
        <h5>Liste des catégories</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom de la catégorie" v-model="name"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Catégorie', field: 'name', object: true }]"
            :data="categories"
            :filter="{ val: this.name, field: 'name' }"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier' },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="categories"
            :paging="10"
            @edit="editCategory"
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

        editCategory(category) {
            this.$router.push(`/categories/${category.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            categories: state => state.objects.categories
        })
    }
};
</script>
