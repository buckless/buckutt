<template>
    <main class="layout">
        <h2 class="title">{{ $t('layouts.login.title') }}</h2>
        <Card class="card">
            <h4 class="card-title">{{ title }}</h4>

            <div class="content">
                <slot />
            </div>
        </Card>
        <div class="links">
            <slot name="links" />

            <PageLink
                href="https://buckless.com/static/cgu.pdf"
                target="_blank"
                rel="noref noopener"
            >
                {{ $t('layouts.login.legal') }}
            </PageLink>

            <PageLink to="/faq">
                {{ $t('components.menu.help') }}
            </PageLink>

            <PageLink @click="setLanguageModalOpened(true)">
                {{ $t('common.language') }}
            </PageLink>
        </div>
    </main>
</template>

<script>
import { mapMutations } from 'vuex';

import Card from 'ui/src/components/Card/Card';
import PageLink from '../components/pageLink/PageLink';

export default {
    components: {
        Card,
        PageLink
    },

    props: {
        title: String
    },

    methods: mapMutations({
        setLanguageModalOpened: 'user/SET_LANGUAGE_MODAL_OPENED'
    })
};
</script>

<style scoped>
.layout {
    flex: 1;
    max-width: 480px;
    margin: 60px auto 0 auto;
}

.title {
    margin-bottom: 40px;
    margin-top: 0;

    text-align: center;
    font-size: var(--typography-h2-size);
    letter-spacing: var(--typography-h2-spacing);
    font-weight: var(--typography-h2-weight);
}

.card {
    margin: 0;
    padding: 24px 40px;
}

.card-title {
    margin: 0 0 32px 0;

    text-align: center;
    font-size: 18px;
    font-weight: 600;
}

.links {
    display: flex;
    justify-content: center;

    margin-top: 40px;
}

.links * {
    color: var(--foreground-dark-200);
    text-decoration: none;
    font-weight: 600;
}

.links *:not(:last-child) {
    margin-right: 24px;
}

@media (max-width: 768px) {
    .card {
        padding: 24px 20px;
        margin: 0 8px;
    }
}
</style>
