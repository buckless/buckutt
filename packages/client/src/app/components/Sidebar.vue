<template>
    <div class="b-sidebar">
        <div class="b-sidebar__items">
            <sidebar-reload v-if="reloadAmount > 0" :amount="reloadAmount"></sidebar-reload>
            <sidebar-refund v-if="refundAmount > 0" :amount="refundAmount"></sidebar-refund>
            <sidebar-item
                v-for="item in sidebarCatering"
                :key="`catering_${item.id}`"
                :id="item.id"
                :name="item.name"
                :count="item.count"
                type="catering"
            ></sidebar-item>
            <sidebar-promotion
                v-for="promotion in sidebar.promotions"
                :key="promotion.id"
                :id="promotion.id"
                :name="promotion.name"
                :content="promotion.content"
            ></sidebar-promotion>
            <sidebar-item
                v-for="item in sidebarItems"
                :key="item.id"
                :id="item.id"
                :name="item.name"
                :count="item.count"
            ></sidebar-item>
        </div>
        <sidebar-validate></sidebar-validate>
    </div>
</template>

<script>
import { countBy } from 'lodash/collection';
import { mapGetters } from 'vuex';

import SidebarItem from './Sidebar-Item';
import SidebarPromotion from './Sidebar-Promotion';
import SidebarReload from './Sidebar-Reload';
import SidebarRefund from './Sidebar-Refund';
import SidebarValidate from './Sidebar-Validate';

export default {
    computed: {
        ...mapGetters(['reloadAmount', 'refundAmount', 'sidebar']),

        sidebarItems() {
            const counts = countBy(this.sidebar.items.map(item => item.id));

            return Object.keys(counts).map(id => {
                const item = this.sidebar.items.find(item => item.id === id);
                return {
                    id: id,
                    name: item.name,
                    count: counts[id]
                };
            });
        },

        sidebarCatering() {
            const counts = countBy(this.sidebar.catering.map(item => item.id));

            return Object.keys(counts).map(id => {
                const item = this.sidebar.catering.find(item => item.id === id);
                return {
                    id: id,
                    name: item.name,
                    count: counts[id]
                };
            });
        }
    },

    components: {
        SidebarItem,
        SidebarPromotion,
        SidebarReload,
        SidebarRefund,
        SidebarValidate
    }
};
</script>

<style scoped>
.b-sidebar {
    background-color: #dee2e6;
    box-shadow: inset 1px 1px 3px #919eaa;
    display: flex;
    flex-direction: column;
    width: 260px;
}

.b-sidebar__items {
    flex: 1;
}

@media (max-width: 768px) {
    .b-sidebar {
        width: 0;
    }

    .b-sidebar__items {
        display: none;
    }
}
</style>
