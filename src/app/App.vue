<template>
    <div id="app">
        <topbar />
        <main class="b-main">
            <router-view />
        </main>
        <transition name="b--fade">
            <loading v-if="loaded === false" />
        </transition>
        <alcohol-warning v-if="isSellerMode" />
        <disconnect-warning />
        <error />
        <alert v-if="alert" />
        <ticket v-if="lastUser.display && isCashMode" :user="lastUser" />
    </div>
</template>

<script>
import 'normalize.css';
import { mapActions, mapGetters, mapState } from 'vuex';

import OfflineData from '@/../lib/offlineData';
import fingerprint from '@/../lib/fingerprint';
import nfc from '@/../lib/nfc';

import Topbar from './components/Topbar';
import Loading from './components/Loading';
import Error from './components/Error';
import Alert from './components/Alert';
import AlcoholWarning from './components/AlcoholWarning';
import DisconnectWarning from './components/DisconnectWarning';
import Ticket from './components/Ticket';

export default {
    name: 'App',

    components: {
        Topbar,
        Loading,
        Error,
        Alert,
        AlcoholWarning,
        DisconnectWarning,
        Ticket
    },

    computed: {
        ...mapState({
            seller: state => state.auth.seller,
            loaded: state => state.ui.dataLoaded,
            lastUser: state => state.ui.lastUser,
            reloadState: state => state.reload.reloadState,
            alert: state => state.auth.alert
        }),

        ...mapGetters(['isSellerMode', 'isReloaderMode', 'isCashMode']),

        reloadOnly() {
            return !this.isSellerMode && this.isReloaderMode;
        }
    },

    methods: {
        ...mapActions([
            'setupSocket',
            'updateEssentials',
            'updateStoredItems',
            'updateUsersData',
            'initQueue'
        ])
    },

    mounted() {
        this.setupSocket();
        this.initQueue();
        this.updateEssentials();
        this.updateStoredItems();
        this.updateUsersData();

        window.nfc = nfc;
        window.fingerprint = fingerprint();
        window.appId = Date.now();
        window.database = new OfflineData();
        window.database.init();
    }
};
</script>

<style>
@import './app.css';

@font-face {
    font-family: 'Roboto';
    src: url(./assets/fonts/Roboto-Light.woff2) format('woff2');
    font-weight: 300;
    font-style: normal;
}

@font-face {
    font-family: 'Roboto';
    src: url(./assets/fonts/Roboto-LightItalic.woff2) format('woff2');
    font-weight: 300;
    font-style: italic;
}

@font-face {
    font-family: 'Roboto';
    src: url(./assets/fonts/Roboto-Regular.woff2) format('woff2');
    font-weight: 400;
    font-style: normal;
}

@font-face {
    font-family: 'Roboto';
    src: url(./assets/fonts/Roboto-RegularItalic.woff2) format('woff2');
    font-weight: 400;
    font-style: italic;
}

@font-face {
    font-family: 'Roboto';
    src: url(./assets/fonts/Roboto-Bold.woff2) format('woff2');
    font-weight: 700;
    font-style: normal;
}

@font-face {
    font-family: 'Roboto';
    src: url(./assets/fonts/Roboto-BoldItalic.woff2) format('woff2');
    font-weight: 700;
    font-style: italic;
}

@font-face {
    font-family: 'Roboto';
    src: url(./assets/fonts/Roboto-Medium.woff2) format('woff2');
    font-weight: 500;
    font-style: italic;
}

@font-face {
    font-family: 'Material Icons';
    font-style: normal;
    font-weight: 400;
    src: url(./assets/icons/MaterialIcons-Regular.woff2) format('woff2');
}
</style>
