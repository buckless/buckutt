<template>
    <nav class="sidebar">
        <router-link to="/dashboard" class="link" active-class="active" exact>
            <Icon name="home" :size="32" />
        </router-link>
        <router-link to="/dashboard/wallet" class="link" active-class="active">
            <Icon name="account_balance_wallet" :size="32" />
        </router-link>
        <router-link to="/dashboard/ticket" class="link" active-class="active">
            <Icon name="theaters" :size="32" />
        </router-link>
        <router-link to="/dashboard/user" class="link" active-class="active">
            <Icon name="person" :size="32" />
        </router-link>
        <div class="space"></div>
        <router-link to="/dashboard/faq" class="link bottom" active-class="active">
            <Icon name="live_help" :size="32" />
        </router-link>
    </nav>
</template>

<script>
import Icon from 'ui/src/components/Icon/Icon';

export default {
    name: 'Sidebar',

    components: {
        Icon
    }
};
</script>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 60px;
    min-width: 60px;

    padding-top: 40px;
    padding-bottom: 16px;

    background-color: var(--primary-300);
}

.link {
    padding: 0;
    border: 0;
    background-color: transparent;
    color: color-mod(var(--grey-50) a(0.66));
    cursor: pointer;
}

.link.active {
    color: var(--grey-50);
}

.link:focus,
.link:active {
    outline: 0;
}

.link:not(:last-of-type) {
    margin-bottom: 32px;
}

.space {
    flex: 1;
}
</style>
