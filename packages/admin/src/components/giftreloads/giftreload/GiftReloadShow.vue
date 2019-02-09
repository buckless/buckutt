<template>
    <div class="b-giftreloads b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                :title="title"
                :tabs="[
                    { route: '', name: 'Détails', exact: true },
                    { route: 'edit', name: 'Édition' }
                ]"
                :inCard="true"
                :goBack="true"
                :level="2"
            >
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { parsePrice } from '../../../lib/price';

export default {
    computed: {
        ...mapState({
            focusedGiftReload: state => state.app.focusedElements[0]
        }),

        title() {
            return `Offre ${parsePrice(this.focusedGiftReload.amount, true)} par ${parsePrice(
                this.focusedGiftReload.everyAmount,
                true
            )} acheté`;
        }
    }
};
</script>
