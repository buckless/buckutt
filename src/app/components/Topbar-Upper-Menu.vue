<template>
    <div class="b-menu-wrapper" v-if="hasActions">
        <div class="b-menu__drop" v-if="showMenu && !history && !treasury && !catering && !onlyLogout" @click="showMenu = false"></div>
        <div class="b-menu" v-if="!history && !treasury && !catering && !onlyLogout">
            <div class="b-menu__icon b-icon" @click="showMenu = !showMenu">menu</div>
            <div class="b-menu__actions" v-if="showMenu">
                <div
                    v-if="isSellerMode"
                    class="b-menu__actions__action"
                    @click="close(clearBasket)">
                    <i class="b-icon">delete_forever</i>
                    Vider le panier
                </div>
                <div class="b-menu__actions__separator"></div>
                <div
                    v-if="isSellerMode"
                    class="b-menu__actions__action"
                    @click="close(toggleHistory)">
                    <i class="b-icon">history</i>
                    Historique
                </div>
                <div class="b-menu__actions__separator"></div>
                <div
                    v-if="isSellerMode && useCardData"
                    class="b-menu__actions__action"
                    @click="close(toggleCatering)">
                    <i class="b-icon">shopping_basket</i>
                    Catering
                </div>
                <div class="b-menu__actions__separator"></div>
                <div
                    v-if="isReloaderMode && isSellerMode"
                    class="b-menu__actions__action"
                    @click="close(openReloadModal)">
                    <i class="b-icon">attach_money</i>
                    Rechargement
                </div>
                <div class="b-menu__actions__separator"></div>
                <div
                    v-if="(isReloaderMode || isSellerMode) && !history"
                    class="b-menu__actions__action"
                    @click="close(toggleTreasury)">
                    <i class="b-icon">account_balance</i>
                    Trésorerie
                </div>
                <div class="b-menu__actions__separator"></div>
                <div
                    class="b-menu__actions__action"
                    @click="syncQueue">
                    <i class="b-icon">sync</i>
                    <template v-if="syncing">
                        Synchronisation en cours
                    </template>
                    <template v-else>
                        Resynchroniser manuellement
                    </template>
                </div>
                <div class="b-menu__actions__separator"></div>
                <div
                    v-if="displayLogout"
                    class="b-menu__actions__action"
                    @click="close(logout)">
                    <i class="b-icon">eject</i>
                    Déconnexion
                </div>
            </div>
        </div>
        <div class="b-menu" @click="close(toggleTreasury)" v-else-if="treasury && !onlyLogout">
            <div class="b-menu__icon b-icon">close</div>
        </div>
        <div class="b-menu" @click="close(toggleHistory)" v-else-if="history && !onlyLogout">
            <div class="b-menu__icon b-icon">close</div>
        </div>
        <div class="b-menu" @click="close(toggleCatering)" v-else-if="catering && !onlyLogout">
            <div class="b-menu__icon b-icon">close</div>
        </div>
        <div class="b-menu" @click="close(logout)" v-else>
            <div class="b-menu__icon b-icon">close</div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    props: {
        isSellerMode: Boolean,
        isReloaderMode: Boolean,
        displayLogout: Boolean,
        onlyLogout: Boolean,
        history: Boolean,
        treasury: Boolean,
        catering: Boolean,
        useCardData: Boolean
    },

    data() {
        return {
            showMenu: false
        };
    },

    computed: {
        hasActions() {
            return this.isSellerMode || this.isReloaderMode || this.displayLogout;
        },

        ...mapState({
            syncing: state => state.online.syncing
        })
    },

    methods: {
        close(action) {
            this.showMenu = false;
            action();
        },

        ...mapActions([
            'openReloadModal',
            'toggleHistory',
            'toggleTreasury',
            'toggleCatering',
            'clearBasket',
            'logout',
            'syncQueue'
        ])
    }
};
</script>

<style>
.b-menu {
    position: relative;
}

.b-menu__drop {
    bottom: 0;
    cursor: pointer;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 3;
}

.b-menu__icon {
    align-items: center;
    background-color: #fff;
    border-radius: 28px;
    color: #222;
    cursor: pointer;
    display: flex;
    height: 28px;
    padding: 6px 8px;
    position: relative;
}

.b-menu__actions {
    position: absolute;
    background: #fff;
    color: #444;
    cursor: pointer;
    right: 0;
    bottom: -16px;
    transform: translateY(100%);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    width: 165px;
    z-index: 4;
}

.b-menu__actions:before {
    bottom: 100%;
    right: 22px;
    border: solid transparent;
    content: '';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(255, 255, 255, 0);
    border-bottom-color: #ffffff;
    border-width: 8px;
    margin-left: -8px;
}

.b-menu__actions__action {
    padding: 12px 14px;
    display: flex;
    align-items: center;
    cursor: pointer;

    &:first-child {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }

    &:last-child {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    &:hover {
        background-color: #f4f4f4;
    }

    & > i {
        margin-right: 6px;
    }
}

.b-menu__actions__separator {
    height: 1px;
    margin: 0 auto;
    background-color: #f4f4f4;
    width: 80%;
}

.b-menu__actions__separator + .b-menu__actions__separator {
    display: none;
}
</style>
