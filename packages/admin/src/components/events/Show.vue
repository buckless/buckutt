<template>
    <div class="b-show">
        <b-navbar :icon="icon" :title="title" :tabs="displayedTabs" class="b-show-content" />
        <router-view
            class="b-show-content"
            :key="$route.path.split('/')[3] || $route.path"
        ></router-view>
    </div>
</template>

<script>
import Navbar from '../base/Navbar.vue';

export default {
    components: {
        'b-navbar': Navbar
    },

    props: {
        route: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        tabs: {
            type: Array,
            required: false,
            default: () => []
        }
    },

    computed: {
        displayedTabs() {
            return this.tabs.map(tab => ({
                ...tab,
                route: tab.route ? `/events/${this.route}/${tab.route}` : `/events/${this.route}`
            }));
        }
    }
};
</script>

<style scoped>
.b-show {
    flex: 1;
    padding: 20px;

    & > .b-show-content {
        max-width: 870px;
        margin: 0 auto;
    }
}
</style>
