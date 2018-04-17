<template>
    <div class="b-switcher mdc-menu-anchor" v-show="linkedUsers.length > 1">
        <div class="b-switcher__button" @click="toggleMenu">
            <span>{{ activeUser.firstname }} {{ activeUser.lastname }}</span>
            <div class="b-space"></div>
            <i class="material-icons">group</i>
        </div>
        <div class="mdc-menu" tabindex="-1" ref="menu">
            <ul class="mdc-menu__items mdc-list" role="menu" aria-hidden="true">
                <li class="mdc-list-item" role="menuitem" tabindex="0" v-for="user in linkedUsers" @click="changeUser(user)">
                    <span>{{ user.firstname }} {{ user.lastname }}</span>
                    <div class="b-space"></div>
                    <div>{{ user.credit | price(true) }}</div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { MDCMenu, Corner } from '@material/menu/dist/mdc.menu.min.js';
import { mapState, mapActions } from 'vuex';

export default {
    computed: {
        ...mapState({
            activeUser: state => state.app.loggedUser,
            linkedUsers: state => state.app.loggedLinkedUsers.filter(u => u.username)
        })
    },

    methods: {
        toggleMenu() {
            this.menu.open = !this.menu.open;
        },

        changeUser(user) {
            setTimeout(() => (this.menu.open = false), 300);

            if (this.working || user.id === this.activeUser.id) {
                return;
            }

            this.working = true;

            this.switchUser({ meanOfLogin: 'username', data: user.username })
                .then(() => {
                    this.working = false;
                });
        },

        ...mapActions(['switchUser'])
    },

    mounted() {
        this.menu = MDCMenu.attachTo(this.$refs.menu);
        this.menu.setAnchorCorner(Corner.CENTER_TOP);
    }
};
</script>

<style>
.b-switcher__button {
    display: flex;
    align-items: center;
    width: 200px;
    margin: 1rem auto;
    padding: 12px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #fafafa;
    cursor: pointer;
}

.b-switcher .mdc-menu {
    left: 50% !important;
    transform: translateX(-50%) !important;
}

.b-switcher .mdc-list-item {
    cursor: pointer;
}

.b-switcher .mdc-list-item span:first-child {
    max-width: calc(100% - 60px);
    overflow: hidden;
    text-overflow: ellipsis;
}

.b-switcher .mdc-list-item div:last-child {
    color: #555;
    font-weight: bold;
    margin-left: 12px;
}
</style>
