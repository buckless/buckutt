<template>
    <div class="b-show">
        <b-navbar
            v-if="focusedElement"
            :title="field"
            :tabs="extraTabsFilter"
            :model="model"
            default="Détails"
            :icon="icon"
            class="b-show-content"
        />
        <router-view :key="focusedElement.id || $route.path" class="b-show-content"></router-view>
        <router-view name="create" :key="$route.path"></router-view>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Navbar from './Navbar.vue';

export default {
    components: {
        'b-navbar': Navbar
    },

    props: {
        model: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        extraTabs: {
            type: Array,
            required: false,
            default: () => []
        },
        itemList: {
            type: Object,
            required: true
        }
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
        },

        extraTabsFilter() {
            return [{ title: 'Détails', route: `/${this.model}/${this.focusedElement.id}` }].concat(
                this.extraTabs
                    .filter(tab => !tab.deactivation || !tab.deactivation(this.focusedElement))
                    .map(tab => ({
                        ...tab,
                        route: `/${this.model}/${this.focusedElement.id}/${tab.route}`
                    }))
            );
        },

        field() {
            if (this.itemList.field === 'fullname') {
                return `${this.focusedElement.firstname} ${this.focusedElement.lastname}`;
            }

            return this.focusedElement[this.itemList.field];
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
