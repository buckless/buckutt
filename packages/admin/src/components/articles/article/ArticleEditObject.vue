<template>
    <div class="b-articles-container">
        <div>
            <h5>Modifier l'article {{ focusedArticle.name }}</h5>
            <form @submit.prevent="updateArticle(focusedArticle)">
                <mdl-textfield
                    floating-label="Nom"
                    :value="focusedArticle.name"
                    @input="updateDeepestFocusedElement({ field: 'name', value: $event })"
                    required="required"
                    error="Le nom doit contenir au moins un caractère"
                ></mdl-textfield>
                <mdl-textfield
                    floating-label="Alcool"
                    :value="focusedArticle.alcohol"
                    @input="updateDeepestFocusedElement({ field: 'alcohol', value: $event })"
                ></mdl-textfield>
                <mdl-button colored raised>Modifier</mdl-button>
            </form>
        </div>
        <div>
            <h5>Image</h5>
            <b-uploader
                :id="focusedArticle.id"
                :name="focusedArticle.name"
                @change="imageUpdated"
            ></b-uploader>
        </div>
    </div>
</template>

<script>
import pick from 'lodash.pick';
import { mapState, mapActions } from 'vuex';
import ImageUploader from '../../ImageUploader.vue';

export default {
    components: {
        'b-uploader': ImageUploader
    },

    methods: {
        ...mapActions(['updateObject', 'updateDeepestFocusedElement', 'notify', 'notifyError']),

        updateArticle(article) {
            const fields = ['id', 'name', 'alcohol'];

            this.updateObject({ route: 'articles', value: pick(article, fields) })
                .then(() => this.notify({ message: "L'article a bien été modifié" }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la modification de l'article",
                        full: err
                    })
                );
        },

        imageUpdated(error) {
            if (error) {
                return this.notifyError({
                    message: "L'image de l'article a bien été modifiée",
                    full: error
                });
            }

            this.notify({ message: "L'image de l'article a bien été modifiée" });
        }
    },

    computed: {
        ...mapState({
            focusedArticle: state => state.app.focusedElements[0]
        })
    }
};
</script>

<style>
.b-articles-container {
    display: flex;
    flex-wrap: wrap;

    & > div:first-child {
        margin-right: 50px;
    }
}
</style>
