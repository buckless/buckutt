<template>
    <div>
        <h5>Ajouter un article</h5>
        <form @submit.prevent="createArticle(newArticle)">
            <mdl-textfield floating-label="Nom" v-model="newArticle.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newArticle: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createArticle(article) {
            this.createObject({ route: 'articles', value: article })
                .then(createdArticle => {
                    this.notify({ message: "L'article a bien été créé" });
                    this.$router.push(`/articles/${createdArticle.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la création de l'article",
                        full: err
                    })
                );
        }
    }
};
</script>
