<template>
    <div class="b-promotions b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                :title="title"
                :tabs="[{ route: '', name: 'Détails', exact: true }, { route: 'edit', name: 'Édition' }, { route: 'content', name: 'Contenu' }]"
                :inCard="true"
                :goBack="true"
                :level="2">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedPromotion: state => state.app.focusedElements[0]
        }),

        title() {
            return `Formule ${this.focusedPromotion.name}`;
        }
    }
};
</script>
