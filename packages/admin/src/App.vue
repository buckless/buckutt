<template>
    <div class="b-app" v-if="firstLoad">
        <b-sidebar></b-sidebar>
        <div class="b-app-content">
            <b-topbar></b-topbar>
            <router-view class="b-container"></router-view>
        </div>
        <b-notifications></b-notifications>
    </div>
    <div v-else class="spinner"></div>
</template>

<script>
import { mapState } from 'vuex';
import Sidebar from './components/Sidebar.vue';
import Topbar from './components/Topbar.vue';
import Notifications from './components/Notifications.vue';

export default {
    components: {
        'b-sidebar': Sidebar,
        'b-topbar': Topbar,
        'b-notifications': Notifications
    },

    computed: {
        ...mapState({
            firstLoad: state => state.app.firstLoad
        })
    }
};
</script>

<style>
@import './main.css';

.b-app {
    width: 100%;
    height: 100%;
    display: flex;
}

.b-app-content {
    flex: 1;
    max-width: calc(100vw - var(--sidebarWidth));
}
</style>
