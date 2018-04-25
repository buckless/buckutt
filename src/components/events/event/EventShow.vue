<template>
    <div class="b-events b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Options de l'événement"
                :tabs="[{ route: '', name: 'Détails', exact: true }, { route: 'edit', name: 'Édition' }, { route: 'config', name: 'Configuration' }, { route: nfcLink, name: 'Support NFC' }]"
                :inCard="true"
                :goBack="false"
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
            focusedEvent: state => state.app.focusedElements[0]
        }),

        nfcLink() {
            return `nfc/${this.focusedEvent.nfc_id}`;
        }
    }
};
</script>
