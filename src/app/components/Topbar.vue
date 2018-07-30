<template>
    <header class="b-header">
        <div class="b-header__user-image" v-if="buyer.isAuth && showPicture">
            <img src="../assets/placeholder.jpg" height="150" width="150" />
        </div>
        <upper />
        <div class="b-header__buyer-credit" v-if="buyer.isAuth">
            <span :class="{ 'b-header__buyer__credit--negative': buyer.credit < 0 }">
                <currency :value="buyer.credit"></currency>
            </span>
        </div>
        <lower />
        <reload />
    </header>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import isMobile from '@/utils/isMobile';

import Currency from './Currency';
import Lower from './Topbar-Lower';
import Upper from './Topbar-Upper';
import Reload from './Topbar-Reload';

export default {
    components: {
        Lower,
        Upper,
        Reload,
        Currency
    },

    computed: {
        isMobile() {
            return isMobile();
        },

        ...mapState({
            showPicture: state => state.auth.device.config.showPicture,
            seller: state => state.auth.seller,
            buyer: state => state.auth.buyer
        })
    }
};
</script>

<style scoped>
@import '../main.css';

.b-header {
    background-color: $blue;
    color: #fff;
    width: 100%;
}

.b-header__user-image {
    float: left;
    width: 150px;
}

.b-header__buyer-credit {
    padding: 6px 24px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
}

@media (max-width: 768px) {
    .b-header {
    }
}
</style>
