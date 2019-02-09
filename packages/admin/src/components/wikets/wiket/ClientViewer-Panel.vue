<template>
    <div class="b-panel">
        <b-priceseditor
            :point="focusedPoint"
            :item="focusedItem"
            :isArticle="isArticle">
        </b-priceseditor>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import PricesEditor from './Article-Prices';

export default {
    components: {
        'b-priceseditor': PricesEditor
    },

    computed: {
        ...mapState({
            focusedPoint: state => state.app.focusedElements[0],
            focusedItem: state => state.app.focusedElements[2],
            isArticle: state => !!state.route.params.article
        })
    }
};
</script>
