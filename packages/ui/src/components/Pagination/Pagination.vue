<template>
    <div class="pagination">
        <div class="header">
            <div class="left">
                <SearchInput placeholder="Filtrer" v-model="filter" />
                <span class="results"
                    >{{ filteredRows.length }} résultat<template v-if="filteredRows.length > 1"
                        >s</template
                    ></span
                >
            </div>
            <div class="space"></div>
            <div class="resultsPerPage">
                <Select
                    label="Nombre résultats par page :"
                    v-model="resultsPerPage"
                    :options="resultsPerPageOptions"
                />
            </div>
        </div>
        <div class="table" v-if="visibleRows.length > 0">
            <!-- @slot Table element (use `v-slot="{ rows }"`) -->
            <slot :rows="visibleRows" />
        </div>
        <div class="table is-empty" v-else>
            <slot name="empty-state">
                Aucun résultat.
            </slot>
        </div>
        <div class="buttons">
            <Button :disabled="pagesNumber === 0 || shownPage === 0" @click="goTo(shownPage - 1)">
                <Icon name="chevron_left" />
            </Button>

            <div class="space" />

            <template v-for="(paginationButton, i) in paginationButtons">
                <Button
                    :key="i"
                    v-if="paginationButton.isLink"
                    @click="goTo(paginationButton.page - 1)"
                    :raised="shownPage === paginationButton.page - 1"
                >
                    {{ paginationButton.page }}
                </Button>

                <span :key="i" class="dots" v-else>...</span>
            </template>

            <div class="space" />

            <Button
                :disabled="pagesNumber === 0 || shownPage === pagesNumber - 1"
                @click="goTo(shownPage + 1)"
            >
                <Icon name="chevron_right" />
            </Button>
        </div>
    </div>
</template>

<script>
import { filter as fuzzy } from 'fuzzyjs';

import SearchInput from '../SearchInput/SearchInput';
import Select from '../Select/Select';
import Icon from '../Icon/Icon';
import Button from '../Button/Button';

import { validator } from '../Table/rows';
import { generateButtons } from './pagesButtons';

/**
 * Pagination container for Table
 */
export default {
    name: 'Pagination',

    components: {
        SearchInput,
        Select,
        Icon,
        Button
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

    data: () => ({
        resultsPerPage: 10,
        currentPage: 0,
        filter: '',
        resultsPerPageOptions: [
            { value: 5, name: '5' },
            { value: 10, name: '10' },
            { value: 25, name: '25' },
            { value: 50, name: '50' }
        ]
    }),

    computed: {
        filteredRows() {
            return this.rows.filter(fuzzy(this.filter, { sourceAccessor: source => source.title }));
        },

        visibleRows() {
            return this.filteredRows.slice(
                this.shownPage * this.resultsPerPage,
                (this.shownPage + 1) * this.resultsPerPage
            );
        },

        pagesNumber() {
            return Math.ceil(this.filteredRows.length / this.resultsPerPage);
        },

        paginationButtons() {
            return generateButtons(this.shownPage, this.pagesNumber - 1);
        },

        shownPage() {
            return Math.min(this.currentPage, this.pagesNumber - 1);
        }
    },

    methods: {
        goTo(page) {
            this.currentPage = Math.max(0, Math.min(page, this.pagesNumber - 1));
        }
    }
};
</script>

<style scoped>
.pagination {
    color: var(--foreground-dark-300);
}

.header {
    display: flex;
    align-items: flex-end;
    margin-bottom: 16px;
}

.space {
    flex: 1;
}

.left {
    display: flex;
    align-items: center;
}

.results {
    margin-left: 12px;
}

.resultsPerPage {
    width: 195px;
}

.table.is-empty {
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--foreground-dark-200);
}

.buttons {
    display: flex;
    align-items: center;
    margin-top: 16px;
}

.dots {
    display: inline-block;
    padding: 0 16px;

    font-family: var(--typography-family);
    font-weight: var(--typography-button-weight);
    font-size: var(--typography-button-size);
    letter-spacing: var(--typography-button-spacing);
}

.button,
.dots {
    margin: 0 4px;
}
</style>
