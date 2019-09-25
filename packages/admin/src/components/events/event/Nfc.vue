<template>
    <b-card class="b-nfc">
        <b-priceseditor :point="internetPoint" :item="focusedArticle" isArticle />
    </b-card>
</template>

<script>
import { mapGetters } from 'vuex';
import PricesEditor from '../../points/PricesEditor';

export default {
    components: {
        'b-priceseditor': PricesEditor
    },

    computed: {
        ...mapGetters(['event', 'focusedElements', 'internetPoint']),

        focusedArticle() {
            return this.focusedElements[0];
        }
    },

    mounted() {
        if (!this.focusedArticle) {
            this.$router.push(`/events/event/nfc/${this.event.nfc_id}`);
        }
    }
};
</script>

<style scoped>
.b-nfc {
    overflow: visible !important;
}
</style>
