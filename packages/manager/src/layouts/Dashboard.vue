<template>
    <main class="dashboard">
        <div class="content">
            <Sidebar />
            <router-view />
        </div>

        <div class="links">
            <PageLink @click="setLanguageModalOpened(true)">
                {{ $t('common.language') }}
            </PageLink>
            <PageLink @click="logout">
                {{ $t('layouts.dashboard.logout') }}
            </PageLink>
            <PageLink
                href="https://buckless.com/static/cgu.pdf"
                target="_blank"
                rel="noref noopener"
            >
                {{ $t('layouts.dashboard.legal') }}
            </PageLink>
        </div>
    </main>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

import Sidebar from '../components/sidebar/Sidebar';
import PageLink from '../components/pageLink/PageLink';

export default {
    components: {
        Sidebar,
        PageLink
    },

    methods: {
        ...mapActions({
            logout: 'user/logout'
        }),

        ...mapMutations({
            setLanguageModalOpened: 'user/SET_LANGUAGE_MODAL_OPENED'
        })
    }
};
</script>

<style scoped>
.dashboard {
    position: relative;
    display: flex;
    flex-direction: column;
}

.content {
    flex: 1;
    display: flex;
    justify-content: stretch;
    height: 100%;
    background-color: var(--grey-200);
}

.links {
    position: absolute;
    display: flex;
    flex-direction: column;
    bottom: 24px;
    right: 24px;
    text-align: right;
}

.links > :not(:last-child) {
    margin-bottom: 12px;
}

@media (max-width: 768px) {
    .dashboard,
    .content {
        height: auto;
    }

    .sidebar {
        display: none;
    }

    .links {
        position: static;
        margin: 0 12px 12px 0;
    }
}
</style>
