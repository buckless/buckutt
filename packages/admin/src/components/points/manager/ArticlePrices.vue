<template>
    <b-container dropShadow @close="back">
        <b-modal
            :title="`Tarifs de l'article ${focusedArticle.name}`"
            @close="back"
            class="b-prices"
        >
            <b-priceseditor
                :isArticle="true"
                :item="focusedArticle"
                :point="focusedPoint"
            ></b-priceseditor>
            <template slot="actions">
                <b-button @click="back">Retour</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import { mapGetters } from 'vuex';
import PricesEditor from '../PricesEditor.vue';

export default {
    components: {
        'b-priceseditor': PricesEditor
    },

    methods: {
        back() {
            this.$router.go(-1);
        }
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedPoint() {
            return this.focusedElements[0];
        },

        focusedArticle() {
            return this.focusedElements[2];
        }
    }
};
</script>

<style scoped>
.b-prices {
    max-width: unset !important;
    overflow: visible !important;
}
</style>
