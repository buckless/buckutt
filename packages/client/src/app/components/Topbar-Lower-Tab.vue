<template>
    <div class="b-tab" :class="{ 'b-tab--selected': selected }" @click="selectTab(id)">
        {{ name }}
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
    props: {
        name: { type: String, required: true },
        id: { type: String, required: true }
    },

    computed: {
        selected() {
            return this.tab === this.id;
        },

        ...mapState({
            tab: state => state.ui.currentTabId
        })
    },

    methods: mapActions(['selectTab'])
};
</script>

<style scoped>
@import '../main.css';

.b-tab {
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    line-height: 46px;
    text-align: center;
    padding: 0 20px;
    position: relative;
    text-transform: uppercase;
    transition: color 0.2s ease;

    &:after {
        background-color: transparent;
        bottom: 0;
        content: ' ';
        height: 3px;
        left: 0;
        position: absolute;
        transition: background-color 0.2s ease;
        width: 100%;
    }

    &:not(:first-child) {
        margin-left: 20px;
    }

    &--selected {
        color: #fff;

        &:after {
            background-color: $red;
        }
    }
}
</style>
