<template>
    <div>
        <b-objecttitle :icon="icon" :title="title"></b-objecttitle>
        <b-tabs class="b-tabs" v-if="tabs.length > 0" v-model="currentTab" @change="changeTab">
            <b-tab v-if="tabs" v-for="tab in tabs" :title="tab.title" :key="tab.route"></b-tab>
        </b-tabs>
    </div>
</template>

<script>
import ObjectTitle from './object/ObjectTitle.vue';

export default {
    components: {
        'b-objecttitle': ObjectTitle
    },

    props: {
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

    data() {
        return {
            currentTab: 0
        };
    },

    methods: {
        changeTab(value) {
            this.$router.push(this.tabs[value].route);
        },

        updateTabs(to) {
            this.currentTab = this.tabs
                .map((tab, index) => ({ ...tab, index }))
                .sort((a, b) => b.route.length - a.route.length)
                .find(tab => to.indexOf(tab.route) > -1).index;
        }
    },

    mounted() {
        this.updateTabs(this.$route.path);
    }
};
</script>

<style scoped>
.b-tabs {
    margin-top: 30px;
}
</style>
