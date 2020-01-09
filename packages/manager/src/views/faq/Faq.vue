<template>
    <div class="faq">
        <Menu :isOpened="isMenuOpened" @close="toggleMenu" v-if="isDashboard" />
        <Button class="menu-button" @click="toggleMenu" v-if="isDashboard">Menu</Button>
        <Button class="back-button" to="/login" v-else><Icon name="close" :size="32" /></Button>

        <div class="faq-content">
            <div class="title">
                <h3>{{ $t('views.faq.title') }}</h3>
            </div>

            <div class="subcategory" v-for="(category, categoryIndex) in faq" :key="categoryIndex">
                <h5 class="subcategory-title">{{ category.title }}</h5>

                <div class="container">
                    <div class="row" v-for="(row, rowIndex) in category.content" :key="rowIndex">
                        <strong>{{ row.question }}</strong>
                        <p>{{ row.answer }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Button from 'ui/src/components/Button/Button';
import Icon from 'ui/src/components/Icon/Icon';
import Menu from '../../components/menu/Menu';
import DashboardLayout from '../../layouts/Dashboard';

import faq from './questions';

export default {
    components: {
        Button,
        Icon,
        Menu,
        DashboardLayout
    },

    props: {
        isDashboard: { type: Boolean, required: false, default: true }
    },

    data: () => ({
        isMenuOpened: false
    }),

    methods: {
        toggleMenu() {
            this.isMenuOpened = !this.isMenuOpened;
        }
    },

    computed: {
        faq() {
            return faq[this.$i18n.locale];
        }
    }
};
</script>

<style scoped>
.faq {
    flex: 1;
    overflow-y: auto;
}

.faq-content {
    max-width: 800px;
    margin: 0 auto;
    padding-bottom: 60px;
}

.title {
    font-size: var(--typography-h3-size);
    letter-spacing: var(--typography-h3-spacing);
    font-weight: var(--typography-h3-weight);
    text-align: center;
}

.subcategory:not(:last-child) {
    margin-bottom: 20px;
}

.subcategory-title {
    font-size: var(--typography-h5-size);
    letter-spacing: var(--typography-h5-spacing);
    font-weight: var(--typography-h5-weight);
}

.container {
    width: 100%;
    background: var(--grey-50);
    border: 1px solid var(--grey-600);
    border-radius: var(--radius);
    color: var(--foreground-dark-300);
}

.row {
    width: 100%;
    padding: 15px;
}

.row > p {
    margin-bottom: 0;
}

.row:not(:last-child) {
    border-bottom: 1px solid var(--grey-600);
}

.menu-button {
    display: none;
}

.back-button, .menu-button {
    position: absolute;
    top: 12px;
    right: 12px;
}

@media (max-width: 768px) {
    .faq {
        padding: 12px;
    }

    .menu-button {
        display: block;
    }
}
</style>
