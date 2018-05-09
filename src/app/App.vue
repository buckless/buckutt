<template>
    <div id="app">
        <topbar />
        <main class="b-main">
            <login v-if="loginState" ref="login" />
            <history v-if="isSellerMode && history && !treasury && !catering" ref="history" />
            <treasury v-if="(isSellerMode || isReloaderMode) && treasury && !history && !catering" ref="treasury" />
            <catering v-if="isSellerMode && catering && !history && !treasury" ref="catering" />
            <items v-if="isSellerMode && !history && !treasury && !catering" />
            <sidebar v-if="isSellerMode && !history && !treasury && !catering" />
            <controller v-if="isControllerMode" ref="controller" />
            <assigner v-if="isAssignerMode" ref="assign" />
        </main>
        <reload
            v-if="isReloaderMode"
            :reloadOnly="!isSellerMode && isReloaderMode" />
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
/* global IS_ELECTRON */
import 'normalize.css';
import { mapActions, mapGetters, mapState } from 'vuex';

import OfflineData from '@/../lib/offlineData';

import Items from './components/Items';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import Reload from './components/Reload';
import Login from './components/Login';
import Loading from './components/Loading';
import Error from './components/Error';
import Alert from './components/Alert';
import Assigner from './components/Assigner';
import Controller from './components/Controller';
import AlcoholWarning from './components/AlcoholWarning';
import DisconnectWarning from './components/DisconnectWarning';
import Ticket from './components/Ticket';
import History from './components/History';
import Treasury from './components/Treasury';
import Catering from './components/Catering';

export default {
    name: 'App',

    components: {
        Items,
        Topbar,
        Sidebar,
        Reload,
        Login,
        Loading,
        Error,
        Alert,
        Assigner,
        Controller,
        AlcoholWarning,
        DisconnectWarning,
        Ticket,
        History,
        Treasury,
        Catering
    },

    computed: {
        ...mapState({
            buyer: state => state.auth.buyer,
            seller: state => state.auth.seller,
            basketStatus: state => state.basket.basketStatus,
            loaded: state => state.ui.dataLoaded,
            lastUser: state => state.ui.lastUser,
            doubleValidation: state => state.auth.device.config.doubleValidation,
            useCardData: state => state.auth.device.event.config.useCardData,
            online: state => state.online.status,
            history: state => state.history.opened,
            treasury: state => state.treasury.opened,
            catering: state => state.catering.opened,
            alert: state => state.auth.alert
        }),

        ...mapGetters([
            'loginState',
            'isAssignerMode',
            'isSellerMode',
            'isReloaderMode',
            'isControllerMode',
            'isCashMode'
        ])
    },

    methods: {
        ...mapActions(['setupSocket', 'updateEssentials', 'periodicSync'])
    },

    mounted() {
        this.setupSocket();
        this.updateEssentials();
        this.periodicSync();

        setInterval(() => this.updateEssentials(!this.seller.isAuth), 60000);

        let nfc = {
            on() {}
        };

        if (process.env.TARGET === 'electron') {
            const remote = require('electron').remote.getCurrentWindow();
            nfc = remote.nfc;
        } else {
            const NFC = require('../lib/nfc');
            nfc = new NFC();
        }

        window.nfc = nfc;
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
