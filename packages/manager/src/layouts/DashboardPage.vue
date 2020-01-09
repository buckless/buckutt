<template>
    <div class="dashboard-page">
        <Menu :isOpened="isMenuOpened" @close="toggleMenu" />

        <Hero>
            <Button class="menu-button" @click="toggleMenu">{{
                $t('layouts.dashboard.menu')
            }}</Button>

            <div class="wallet-chooser">
                <WalletChooser />
            </div>
            <slot name="hero" />
        </Hero>

        <div class="content">
            <slot />
        </div>
    </div>
</template>

<script>
import Button from 'ui/src/components/Button/Button';
import Hero from '../components/hero/Hero';
import Menu from '../components/menu/Menu';
import WalletChooser from '../components/wallet-chooser/WalletChooser';

export default {
    components: {
        Button,
        Hero,
        Menu,
        WalletChooser
    },

    data: () => ({
        isMenuOpened: false
    }),

    methods: {
        toggleMenu() {
            this.isMenuOpened = !this.isMenuOpened;
        }
    }
};
</script>

<style scoped>
.dashboard-page {
    flex: 1;
    overflow-y: auto;
}

.content {
    padding: 40px 60px;
}

.wallet-chooser {
    position: absolute;
    right: 60px;
    top: 60px;
}

.menu-button {
    display: none;

    position: absolute;
    top: 12px;
    right: 12px;
}

@media (max-width: 768px) {
    .wallet-chooser {
        display: none;
    }

    .hero {
        min-height: 0;
    }

    .content {
        padding: 20px;
    }

    .menu-button {
        display: block;
    }
}
</style>
