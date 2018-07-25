<template>
    <div>
        <h5>Détails de l'article</h5>
        <div class="b-article-top">
            <div class="b-article-preview">
                <img :src="image" :alt="focusedArticle.name" v-show="image" class="b-article-preview__image" />
                <div class="b-article-preview__image" v-show="!image"></div>
            </div>
            <b-list :elements="elements" :columns="2" class="b-article-top__fill"></b-list>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { getImage } from '../../../lib/fetchImages';

export default {
    data() {
        return {
            image: null
        };
    },

    computed: {
        ...mapState({
            focusedArticle: state => state.app.focusedElements[0]
        }),

        elements() {
            return [
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Nom',
                    content: this.focusedArticle.name
                },
                {
                    icon: 'local_drink',
                    title: 'Unités alcool',
                    content:
                        this.focusedArticle.alcohol > 0
                            ? this.focusedArticle.alcohol
                            : 'Non définie'
                }
            ];
        }
    },

    mounted() {
        getImage(this.focusedArticle.id)
            .then(result => {
                this.image = result.image;
            })
            .catch(() => {
                this.image = null;
            });
    }
};
</script>

<style>
.b-article-top {
    display: flex;
    flex-wrap: wrap;

    & .b-article-top__fill {
        flex-grow: 1;
    }
}

.b-article-preview {
    background-image: url('../../../assets/placeholder.jpg');
    background-repeat: no-repeat;
    width: 150px;
    height: 150px;
    min-width: 150px;
    min-height: 150px;
    box-shadow: 0 0 2px color(#222 a(0.25)), 0 2px 3px color(#222 a(0.25));
    border-radius: 2px;
    margin-right: 20px;

    & > .b-article-preview__image {
        position: relative;
        width: 100%;
        height: 100%;
    }
}
</style>
