<template>
    <div id="app">
        <header v-if="isRoot">
            <img :src="logo" alt="Cashless" height="96" />
        </header>
        <Notification />
        <router-view />
        <LangChooser />
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import { reload } from 'config/manager';
import afterUrl from '@/lib/redirectAfterLogin';
import Notification from '@/components/Notification';
import LangChooser from '@/components/LangChooser';

export default {
    name: 'App',

    components: {
        Notification,
        LangChooser
    },

    data: () => ({
        isRoot: false,
        logo: null
    }),

    async mounted() {
        if (reload.name === 'checkout') {
            const checkoutScript = document.createElement('script');
            checkoutScript.setAttribute('src', reload.checkout.scriptLocation);
            checkoutScript.setAttribute('async', true);
            document.head.appendChild(checkoutScript);
        }

        const isLoggedIn = await this.autologin();

        if (isLoggedIn && this.$route.meta.guest) {
            this.$router.push(afterUrl());
        }

        this.isRoot = window.frameElement === null;

        const logoUrl = process.env.BASE_URL + 'img/manager-logo.png';
        const logo = new Image();
        logo.src = logoUrl;
        logo.onload = () => (this.logo = logoUrl);
    },

    methods: {
        ...mapActions({
            autologin: 'user/autologin'
        })
    }
};
</script>

<style lang="scss" src="./main.scss"></style>

<style lang="scss" scoped>
@import '@/theme.scss';

header {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $cardBackground;
}

header > img:not([src]) {
    display: none;
}
</style>
