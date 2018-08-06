<template>
    <nav class="b-lower-bar">
        <div class="b-lower-bar__tabs">
            <tab
                v-for="tab in tabs"
                v-if="!loginState && isSelling"
                :name="tab.name"
                :id="tab.id"
                :key="tab.id"></tab>
        </div>
        <div class="b-lower-bar__device">
            <div
                v-if="seller.isAuth"
                class="b-lower-bar__device__seller">
                <strong>Opérateur: </strong>
                <span class="b--capitalized">{{ seller.firstname }}</span>
                <span class="b--capitalized">{{ seller.lastname }}</span>
            </div>
            <div class="b-lower-bar__device__point">
                <strong>Point: </strong>
                <span>{{ point }}</span>
            </div>
        </div>
    </nav>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import Tab from './Topbar-Lower-Tab';

export default {
    computed: {
        ...mapState({
            point: state => state.auth.device.point.name,
            seller: state => state.auth.seller,
            buyer: state => state.auth.buyer
        }),

        ...mapGetters(['tabs', 'loginState']),

        isSelling() {
            return this.$route.matched[0].path === '/items';
        }
    },

    components: {
        Tab
    }
};
</script>

<style scoped>
@import '../main.css';

.b-lower-bar {
    display: flex;
    flex-direction: row;
}

.b-lower-bar__tabs {
    display: flex;
    flex: 1;
    height: 46px;
    padding-left: 60px;
}

.b-lower-bar__device {
    align-items: center;
    display: flex;
}

.b-lower-bar__device__seller,
.b-lower-bar__device__point {
    height: 100%;
    line-height: 46px;
    padding: 0 10px;
}

@media (max-width: 768px) {
    .b-lower-bar__device {
        font-size: 14px;
        height: 35px;
        overflow-x: auto;
        touch-action: pan-x;
        white-space: nowrap;
        width: 100%;
    }

    .b-lower-bar__tabs {
        display: none;
    }

    .b-lower-bar__device__point {
        flex: 0;
        border-left: 0;
        line-height: 35px;
        margin-left: 0;
    }

    .b-lower-bar__device__seller {
        border-left: 0;
        line-height: 35px;
        margin-left: 0;
    }
}
</style>
