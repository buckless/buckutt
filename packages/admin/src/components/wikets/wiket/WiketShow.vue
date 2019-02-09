<template>
    <div class="b-wikets b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                :title="title"
                :tabs="displayedTabs"
                :inCard="true"
                :goBack="true"
                :level="3">
            </b-navbar>

            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import sortOrder from '../../../lib/sortOrder';

export default {
    methods: {
        ...mapActions(['fetchObjectsAndRelations'])
    },

    computed: {
        ...mapState({
            focusedPoint: state => state.app.focusedElements[0],
            fullPath: state => state.route.fullPath,
            params: state => state.route.params
        }),

        title() {
            return `Guichet ${this.focusedPoint.name}`;
        },

        displayedTabs() {
            const tabs = (this.focusedPoint.categories || [])
                .sort((a, b) => sortOrder(a.name, b.name))
                .map(category => ({
                    route: category.id,
                    name: category.name
                }));

            tabs.push({ route: 'add', icon: 'add_circle_outline' });

            return tabs;
        }
    },

    created() {
        this.fetchObjectsAndRelations({ route: 'promotions' });

        if (!this.params.category && this.fullPath.split('/').length < 5) {
            if (this.displayedTabs[0]) {
                return this.$router.push(
                    `${this.fullPath}/category/${this.displayedTabs[0].route}`
                );
            }
            return this.$router.push(`${this.fullPath}/category/add`);
        }
    }
};
</script>
