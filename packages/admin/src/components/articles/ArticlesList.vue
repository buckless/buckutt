<template>
    <div>
        <h5>Liste des articles</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom de l'article" v-model="name"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Article', field: 'name', object: true }]"
            :data="articles"
            :filter="{ val: this.name, field: 'name' }"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier' },
                { action: 'remove', text: 'Supprimer', type: 'confirm', condition: { field: 'id', statement: 'isNot', value: event.nfc_id } }
            ]"
            route="articles"
            :paging="10"
            @edit="editArticle"
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

        editArticle(article) {
            this.$router.push(`/articles/${article.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            articles: state => state.objects.articles
        }),

        ...mapGetters(['event'])
    }
};
</script>
