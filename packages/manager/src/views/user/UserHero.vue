<template>
    <div class="user-hero">
        <h2 class="title">{{ $t('views.user.hero.title') }}</h2>

        <Card>
            <Icon name="person" :size="40" />
            <div class="text">
                <h5 class="fullname">{{ user.fullName }}</h5>
                {{ user.mail }}
            </div>
        </Card>
    </div>
</template>

<script>
import Card from 'ui/src/components/Card/Card';
import Icon from 'ui/src/components/Icon/Icon';

import { mapGetters } from 'vuex';

export default {
    components: {
        Card,
        Icon
    },

    computed: mapGetters({
        user: 'user/getUser'
    })
};
</script>

<style scoped>
.user-hero {
    padding: 60px 60px 24px 60px;
}

.title {
    margin: 0 0 24px 0;
    font-size: var(--typography-h3-size);
    letter-spacing: var(--typography-h3-spacing);
    font-weight: 400;
}

.card {
    display: flex;
    align-items: center;
    height: 100px;
    width: 475px;
    margin: 0;
}

.icon {
    margin-right: 16px;
}

.text {
    color: var(--foreground-dark-100);
    font-size: var(--typography-body-2-size);
}

.fullname {
    color: var(--foreground-dark-300);
    font-size: var(--typography-h5-size);
    letter-spacing: var(--typography-h5-spacing);
    font-weight: 400;
    margin: 0;
}

@media (max-width: 768px) {
    .user-hero {
        padding: 20px;
    }

    .user-hero .card {
        max-width: 100%;
    }
}
</style>
