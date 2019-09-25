<template>
    <div class="table">
        <div class="row" v-for="row in rows" :key="row.id" @click="onClick(row.id)">
            <Icon v-if="row.icon" :name="row.icon" />
            <div class="content">
                <div class="header">{{ row.title }}</div>
                <div class="subtitle" v-if="row.subtitle">{{ row.subtitle }}</div>
            </div>
            <div class="right" v-if="row.right">{{ row.right }}</div>
            <Icon class="right" v-if="row.rightIcon" :name="row.rightIcon" @click.native="onAction($event, row.id)" />
        </div>
    </div>
</template>

<script>
import Icon from '../Icon/Icon';
import { validator } from './rows';

/**
 * Table component
 */
export default {
    name: 'Table',

    components: {
        Icon
    },

    props: {
        /**
         * Select options. Either a string array, or an array of:
         * ```
         * {
         *   id: any,
         *   title: string,
         *   subtitle?: string,
         *   icon?: string
         *   right?: string
         *   rightIcon?: string
         * }
         * ```
         */
        rows: { type: Array, validator, required: true }
    },

    methods: {
        onClick(id) {
            /**
             * Row clicked (the parameter will be the row id)
             *
             * @event click
             * @type {any}
             */
            this.$emit('click', id);
        },

        onAction(e, id) {
            e.stopPropagation();

            /**
             * Row action clicked (the parameter will be the row id)
             *
             * @event click
             * @type {any}
             */
            this.$emit('action', id);
        }
    }
};
</script>

<style scoped>
.table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--grey-600);
    border-radius: calc(var(--radius) / 2);
    color: var(--foreground-dark-300);
}

.row {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 16px;
    cursor: pointer;
    background-color: var(--grey-50);
    transition: background-color var(--transition-fast-out) var(--transition-easing);
}

.row:not(:last-child) {
    border-bottom: 1px solid var(--grey-600);
}

.row:hover {
    background-color: var(--grey-100);
    transition: background-color var(--transition-fast-in) var(--transition-easing);
}

.row .icon {
    color: var(--primary-300);
    max-width: 24px;
}

.row .icon.right {
    color: var(--foreground-dark-200);
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 16px;
}

.subtitle {
    color: var(--foreground-dark-100);
    font-size: var(--typography-body-2-size);
    letter-spacing: var(--typography-body-2-spacing);
}
</style>
