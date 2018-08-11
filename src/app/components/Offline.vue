<template>
    <div class="b-offline" :class="syncingClass" v-if="!online || syncing">
        <i class="b-icon b-offline__icon">signal_wifi_off</i>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        syncingClass() {
            return this.syncing ? { 'b-offline-syncing': true } : {};
        },

        ...mapState({
            online: state => state.online.status,
            syncing: state =>
                state.online.offline.usersData.locked ||
                state.online.offline.eventEssentials.locked ||
                state.online.offline.items.locked ||
                state.online.offline.queue.locked
        })
    }
};
</script>

<style scoped>
@import '../main.css';

.b-offline {
    background-color: color($red a(0.9));
    border-radius: 3px;
    height: 20px;
    text-align: center;
    width: 40px;
}

.b-offline-syncing {
    background-color: color($orange a(0.9));
}

.b-offline__icon {
    color: #fff;
    font-size: 18px;
    margin-top: 1px;
}
</style>
