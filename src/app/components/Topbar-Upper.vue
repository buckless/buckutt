<template>
    <div class="b-upper-bar">
        <offline />
        <div class="b-upper-bar__buyer-name" v-if="buyer.isAuth">
            <div class="b-upper-bar__buyer-logout">
                <span class="b-icon" @click="logout">eject</span>
            </div>
            <span class="b--capitalized">{{ buyer.firstname }}</span>&nbsp;
            <span class="b--capitalized">{{ buyer.lastname }}</span>
        </div>
        <div class="b-upper-bar__buyer-credit" v-if="buyer.isAuth">
            <span :class="{ 'b-upper-bar__buyer__credit--negative': credit < 0 }">
                <currency :value="credit"></currency>
            </span>
        </div>
        <div class="b-space"></div>
        <div class="b-upper-bar__date" v-if="!buyer.isAuth">
            <live-time></live-time>
        </div>
        <div class="b-upper-bar__menu">
          <b-menu
              :isSellerMode="isSellerMode"
              :isReloaderMode="isReloaderMode"
              :displayLogout="displayLogout"
              :onlyLogout="onlyLogout"
              :history="history"
              :treasury="treasury"
              :catering="catering"
              :useCardData="useCardData"/>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import Currency from './Currency';
import LiveTime from './Topbar-Upper-Time';
import Offline from './Offline';
import Menu from './Topbar-Upper-Menu';

export default {
    components: {
        Currency,
        LiveTime,
        Offline,
        'b-menu': Menu
    },

    computed: {
        ...mapGetters(['credit', 'isSellerMode', 'isReloaderMode']),

        ...mapState({
            history: state => state.history.opened,
            treasury: state => state.treasury.opened,
            catering: state => state.catering.opened,
            useCardData: state => state.auth.device.event.config.useCardData,
            seller: state => state.auth.seller,
            displayLogout: state => state.auth.seller.meanOfLogin.length > 0,
            buyer: state => state.auth.buyer
        }),

        onlyLogout() {
            return this.displayLogout && this.seller.isAuth === false;
        }
    },

    methods: {
        ...mapActions(['logout'])
    }
};
</script>

<style scoped>
@import '../main.css';

.b-upper-bar {
    padding: 0 6px;
}

.b-upper-bar__buyer-name,
.b-upper-bar__buyer-credit {
    align-items: center;
    display: flex;
    flex-direction: row;
    font-size: 18px;
    justify-content: center;
}

.b-upper-bar .b-offline,
.b-upper-bar__buyer-name,
.b-upper-bar__date,
.b-upper-bar__menu {
    margin: 0 6px;
}

.b-upper-bar__buyer-logout {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    color: #222;
    border-radius: 50%;
    margin-right: 4px;
    height: 20px;
    width: 20px;

    .b-icon {
        font-size: 18px;
    }
}

.b-upper-bar__buyer-name {
    font-size: 14px;
}

.b-upper-bar__buyer-credit {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
}

.b-upper-bar {
    display: flex;
    height: 65px;
    position: relative;
    align-items: center;
}

.b-upper-bar__date {
    text-align: center;
}

.b-upper-bar__actions {
    height: 100%;
    display: flex;
    line-height: 65px;

    & > div {
        padding: 0 10px;
        & > .b-icon {
            font-size: 28px;
            line-height: 65px;
        }
    }
}

.b-upper-bar__actions__action-eject,
.b-upper-bar__actions__action-reload,
.b-upper-bar__actions__action-cancel {
    cursor: pointer;
}

.b-upper-bar__buyer__credit--negative {
    color: $red;
    font-weight: bold;
}

@media (max-width: 768px) {
    .b-upper-bar {
        height: 45px;
    }

    .b-upper-bar__buyer {
        font-size: 13px;
        padding-left: 10px;
        justify-content: flex-end;
        padding-bottom: 5px;
    }

    .b-upper-bar__buyer-credit {
        left: unset;
        right: 40px;
        font-size: 22px;
    }

    .b-upper-bar__date {
        font-size: 18px;
        line-height: 45px;
    }

    .b-upper-bar__actions {
        line-height: 45px;

        & > div .b-icon {
            line-height: 45px;
        }
    }

    .b-upper-bar__actions__action-cancel--active > .b-icon {
        color: $red;
    }
}
</style>
