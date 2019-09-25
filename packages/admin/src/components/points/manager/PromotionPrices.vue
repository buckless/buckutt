<template>
    <b-container dropShadow @close="back">
        <b-modal
            :title="`Tarifs de la promotion ${focusedPromotion.name}`"
            @close="back"
            class="b-prices"
        >
            <b-priceseditor
                :isArticle="false"
                :item="focusedPromotion"
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

        focusedPromotion() {
            return this.focusedElements[1];
        }
    }
};
</script>

<style scoped>
.b-prices {
    max-width: unset !important;
}
</style>
