<template>
    <div>
        <div class="b-table-wrapper" v-if="displayedData.length > 0">
            <div class="b-table-wrapper__paging" v-if="paging">
                Afficher <select v-model="chosenPaging"><option v-for="option in pagingOptions">{{ option }}</option></select> entrées
            </div>
            <div class="b-table" :class="hasFooter">
                <div class="b-table__header">
                    <div class="b-table__row b-table__header-row">
                        <div class="b-table__cell b-table__header-cell" :class="header.class" v-for="header in headers">
                            {{ header.title }}
                        </div class="b-table__cell b-table__header-cell">
                    </div class="b-table__row">
                </div class="b-table__header">
                <div class="b-table__body">
                    <div class="b-table__row" v-for="data in displayedData">
                        <div v-for="header in headers" class="b-table__cell" :class="header.class">
                            <span v-if="header.type === 'price'">
                                {{ lodget(data, header.field) | price(true) }}
                            </span>
                            <span v-else-if="header.type === 'date'">
                                {{ lodget(data, header.field) | date }}
                            </span>
                            <span v-else>
                                {{ lodget(data, header.field) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="b-table__footer" v-if="pagesNumber > 1">
                <div class="b-table__row">
                    <div class="b-table__cell">
                        <span>
                            Affichage de {{ displayedData.length }} éléments sur {{ filteredData.length }}
                        </span>
                        <div class="b-space" />
                        <span>
                            <a href="#" @click.prevent="previous()" v-show="hasPrevious">Précedent</a>
                            Page {{ adjustedPage }}/{{ pagesNumber }}
                            <a href="#" @click.prevent="next()" v-show="hasNext">Suivant</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="b-table__empty-content" v-else>
            Aucune donnée à afficher<br/>
            <router-link tag="button" to="/reload" class="mdc-button mdc-button--raised">Recharger mon compte</router-link>
        </div>
    </div>
</template>

<script>
import lodget    from 'lodash.get';
import fuzzy     from 'fuzzy';
import sortOrder from '../lib/sortOrder';
import '../lib/price';
import '../lib/date';

export default {
    props: {
        headers: Array,
        data   : Array,
        filter : {
            type    : Object,
            required: false
        },
        sort: {
            type    : Object,
            required: false
        },
        paging: {
            type    : Number,
            required: false
        }
    },

    data() {
        return {
            page         : 1,
            pagingOptions: [5, 10, 25, 50, 100],
            chosenPaging : this.paging
        };
    },

    methods: {
        previous() {
            if (this.hasPrevious) {
                this.page = this.adjustedPage - 1;
            }
        },

        next() {
            if (this.hasNext) {
                this.page += 1;
            }
        },

        lodget(object, path) {
            return lodget(object, path);
        },

        displayAction(action, object) {
            const condition = action.condition;
            if (condition) {
                switch (condition.statement) {
                    case 'isIn':
                        return (condition.value.indexOf(object[condition.field]) > -1);
                    case 'isNotIn':
                        return (condition.value.indexOf(object[condition.field]) === -1);
                    default:
                        break;
                }
            }
            return true;
        }
    },

    computed: {
        filteredData() {
            if (this.filter) {
                return fuzzy
                    .filter(this.filter.val, this.data, { extract: el => el[this.filter.field] })
                    .map(d => d.original);
            }

            return this.data.slice();
        },

        displayedData() {
            let transformedData = this.filteredData.slice();

            if (this.sort) {
                transformedData = transformedData
                    .sort((a, b) => sortOrder(a[this.sort.field], b[this.sort.field], this.sort.order));
            }

            if (this.paging) {
                transformedData = transformedData
                    .slice(this.start, this.start + parseInt(this.chosenPaging, 10));
            }

            return transformedData;
        },

        start() {
            if (!this.paging) {
                return 0;
            }

            return (this.adjustedPage - 1) * this.chosenPaging;
        },

        pagesNumber() {
            if (!this.paging) {
                return 1;
            }

            return Math.ceil(this.filteredData.length / this.chosenPaging);
        },

        hasPrevious() {
            if (this.adjustedPage - 1 > 0) {
                return true;
            }
            return false;
        },

        hasNext() {
            if (this.adjustedPage + 1 <= this.pagesNumber) {
                return true;
            }
            return false;
        },

        hasFooter() {
            return this.pagesNumber > 1 ? '' : 'b-table--without-footer';
        },

        adjustedPage() {
            return Math.min(this.page, this.pagesNumber);
        },

        columnsNumber() {
            return (this.actions) ? this.headers.length + 1 : this.headers.length;
        }
    }
};
</script>

<style lang="scss">
.b-table-wrapper__paging {
    text-align: right;
}

.b-table {
    margin: 8px -1rem 0 -1rem;
    overflow-x: auto;

    &.b-table--without-footer .b-table__body .b-table__row:last-child {
        border-bottom: 0;
    }
}

.b-table__header,
.b-table__body {
    min-width: 570px;
}

.b-table__row {
    display: flex;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid rgba(0,0,0,.12);

    & > .b-table__cell:first-child {
        flex: 2;
    }

    & > .b-table__cell {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
    }
}

.b-table__row:not(.b-table__header-row) {
    height: 48px;

    &:hover {
        background-color: #eee;
    }
}

.b-table__row > .b-table__numeric-cell {
    text-align: right;
    flex: 0;
}

.b-table__header-row {
    font-weight: 600;
    color: rgba(0,0,0,.54);
    height: 56px;
}

.b-table__footer {
    color: rgba(0,0,0,.54);

    & .b-table__row {
        border-bottom: none;
    }

    & .b-table__cell {
        display: flex;
    }

    & a {
        color: #e74c3c;
        text-decoration: none;
    }
}

.b-table__empty-content {
    text-align: center;

    & > button {
        margin: 10px 0;
    }
}

@media (max-width: 520px) {
    .b-table__footer > .b-table__row {
        padding: 12px 0 0 0;
    }

    .b-table__footer > .b-table__row > .b-table__cell {
        display: block;
        padding: 0;
        text-align: center;
    }
}
</style>
