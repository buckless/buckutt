<template>
    <div class="b-navbar" :class="{ 'b-navbar__inCard': inCard }">
        <div class="mdl-layout__header">
            <div class="mdl-layout__header-row">
                <span class="mdl-layout-title">{{ title }}</span>
            </div>
        </div>
        <div class="mdl-tabs mdl-js-tabs is-upgraded" v-if="tabs">
            <div class="mdl-tabs__tab-bar">
                <router-link to="" @click.native="$root.goBack()" class="mdl-tabs__tab" v-if="goBack">
                    <i class="material-icons mdl-color-text--pink">keyboard_backspace</i>
                </router-link>
                <router-link :to="generateAbsoluteLink(tab.route)" :exact="tab.exact" :key="tab.route"
                    class="mdl-tabs__tab" active-class="is-active" :class="{ 'b--unclickable': tab.clickable === false }"
                    v-for="tab in tabs">
                    <span v-if="tab.name">{{ tab.name }}</span>
                    <i class="material-icons mdl-color-text--pink" v-else>{{ tab.icon }}</i>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        title: String,
        tabs: {
            type: Array,
            required: false
        },
        inCard: {
            type: Boolean,
            required: false
        },
        goBack: {
            type: Boolean,
            required: false
        },
        level: {
            type: Number,
            required: false
        }
    },

    methods: {
        generateAbsoluteLink(relative) {
            if (!this.level) {
                return relative;
            }

            const path = this.fullPath.split('/').slice(0, this.level + 1);

            if (relative) {
                path.push(relative);
            }

            return path.join('/');
        }
    },

    computed: {
        ...mapState({
            fullPath: state => state.route.fullPath
        })
    }
};
</script>

<style>
.b-navbar {
    & > .mdl-tabs {
        & > .mdl-tabs__tab-bar {
            display: flex;
            justify-content: flex-start;

            & > a {
                & > i {
                    vertical-align: middle;
                }
            }
        }
    }
}

.b-navbar__inCard {
    margin-top: -20px;
    margin-left: -20px;
    margin-right: -20px;
    margin-bottom: 10px;
}
</style>
