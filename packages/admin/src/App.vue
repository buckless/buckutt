<template>
    <div>
        <div v-show="firstLoad">
            <b-sidebar></b-sidebar>
            <b-topbar></b-topbar>
            <router-view></router-view>
            <mdl-snackbar display-on="snackfilter"></mdl-snackbar>
        </div>
        <div v-show="!firstLoad" class="spinner"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Sidebar from './components/Sidebar.vue';
import Topbar from './components/Topbar.vue';

export default {
    components: {
        'b-sidebar': Sidebar,
        'b-topbar': Topbar
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
</style>
