<template>
    <div class="b-fundations b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                :title="title"
                :tabs="[{ route: '', name: 'Détails', exact: true }, { route: 'edit', name: 'Édition' }]"
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
            focusedFundation: state => state.app.focusedElements[0]
        }),

        title() {
            return `Fondation ${this.focusedFundation.name}`;
        }
    }
};
</script>
