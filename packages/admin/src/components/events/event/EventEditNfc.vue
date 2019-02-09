<template>
    <div>
        <h5>Modifier les prix du support NFC</h5>
        <b-priceseditor :point="internetPoint" :item="focusedArticle" isArticle> </b-priceseditor>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import PricesEditor from '../../wikets/wiket/Article-Prices';

export default {
    components: {
        'b-priceseditor': PricesEditor
    },

    computed: {
        ...mapState({
            internetPoint: state => state.objects.points.find(point => point.name === 'Internet'),
            focusedArticle: state => state.app.focusedElements[1]
        })
    }
};
</script>

<style>
@import '../../../styles/item.css';
</style>
