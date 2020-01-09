<template>
    <Loader v-if="loading" @loaded="handleLoaded" />
    <div class="b-app" v-else-if="event.activateManager">
        <router-view />
        <Notifications />
        <ChangeLanguage v-if="languageModalOpened" />
    </div>
    <div v-else>{{ $t('views.app.deactivated') }}</div>
</template>

<script>
import { mapGetters } from 'vuex';

import Loader from '../../layouts/Loader';
import Notifications from '../../views/notifications/Notifications';
import ChangeLanguage from '../../views/change-language/ChangeLanguage';

export default {
    name: 'App',

    data: () => ({
        loading: true
    }),

    components: {
        Loader,
        Notifications,
        ChangeLanguage
    },

    methods: {
        handleLoaded() {
            this.loading = false;
        }
    },

    computed: mapGetters({
        languageModalOpened: 'user/getLanguageModalOpened',
        event: 'infos/getEvent'
    })
};
</script>

<style>
@import 'ui/src/theme.css';

* {
    box-sizing: border-box;
}

html,
body,
main {
    font-family: var(--typography-family);
    font-size: 16px;
    height: 100%;
    margin: 0;
    width: 100%;
    background-color: var(--grey-200);
    color: var(--foreground-dark-300);
}

.b-app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
