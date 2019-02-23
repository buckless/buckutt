<template>
    <div class="table-wrapper">
        <div v-if="displayedData.length > 0">
            <div :class="hasFooter" class="table">
                <div class="header">
                    <div class="row header-row">
                        <div
                            v-for="(header, i) in headers"
                            :class="header.class"
                            :key="i"
                            class="cell header-cell"
                        >
                            {{ header.title }}
                        </div>
                    </div>
                </div>
                <div class="body">
                    <div v-for="(data, i) in displayedData" :key="i" class="row">
                        <div
                            v-for="(header, j) in headers"
                            :key="j"
                            :class="header.class"
                            class="cell"
                        >
                            <span v-if="header.type === 'price'">
                                {{ (data[header.field] / 100) | currency }}
                            </span>
                            <span v-else-if="header.type === 'date'">
                                {{ data[header.field] | date }}
                            </span>
                            <span v-else-if="data[header.field].length > 0">
                                {{ data[header.field] }}
                            </span>
                            <ul v-if="header.list" class="table-list">
                                <li v-for="(article, k) in data[header.list]" :key="k">
                                    {{ article }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="pagesNumber > 1" class="footer">
                <div class="row footer-row">
                    <div class="cell">
                        <span>
                            Affichage de {{ displayedData.length }} éléments sur {{ data.length }}
                        </span>
                        <div class="space" />
                        <span>
                            <a v-show="hasPrevious" href="#" @click.prevent="previous()"
                                >Précedent</a
                            >
                            Page {{ adjustedPage }}/{{ pagesNumber }}
                            <a v-show="hasNext" href="#" @click.prevent="next()">Suivant</a>
                        </span>
                    </div>
                </div>
            </div>
            <div v-if="paging" class="paging">
                Afficher
                <select v-model="chosenPaging" class="select">
                    <option v-for="(option, i) in pagingOptions" :key="i">{{ option }}</option>
                </select>
                entrées
            </div>
        </div>

        <div v-else class="empty-content">
            Aucune donnée à afficher
            <br />
            <br />
            <Button to="/" raised>Recharger mon compte</Button>
        </div>
    </div>
</template>

<script>
import Button from '@/components/Button';
import sortOrder from '../lib/sortOrder';
import '../lib/date';

export default {
    name: 'Table',

    components: {
        Button
    },

    props: {
        headers: { type: Array, default: () => [] },
        data: { type: Array, default: () => [] },
        filter: {
            type: Object,
            required: false,
            default: null
        },
        sort: {
            type: Object,
            required: false,
            default: null
        },
        paging: {
            type: Number,
            required: false,
            default: null
        }
    },

    data() {
        return {
            page: 1,
            pagingOptions: [5, 10, 25, 50, 100],
            chosenPaging: 5
        };
    },

    computed: {
        displayedData() {
            let transformedData = this.data.slice();

            if (this.sort) {
                transformedData = transformedData.sort((a, b) =>
                    sortOrder(a[this.sort.field], b[this.sort.field], this.sort.order)
                );
            }

            if (this.paging) {
                transformedData = transformedData.slice(
                    this.start,
                    this.start + parseInt(this.chosenPaging, 10)
                );
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

            return Math.ceil(this.data.length / this.chosenPaging);
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
            return this.pagesNumber > 1 ? '' : 'table--without-footer';
        },

        adjustedPage() {
            return Math.min(this.page, this.pagesNumber);
        },

        columnsNumber() {
            return this.actions ? this.headers.length + 1 : this.headers.length;
        }
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

        displayAction(action, object) {
            const condition = action.condition;
            if (condition) {
                switch (condition.statement) {
                    case 'isIn':
                        return condition.value.indexOf(object[condition.field]) > -1;
                    case 'isNotIn':
                        return condition.value.indexOf(object[condition.field]) === -1;
                    default:
                        break;
                }
            }
            return true;
        }
    }
};
</script>

<style lang="scss">
@import '@/theme.scss';

$border: get-foreground-color($cardBackground, rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.12));
$hover: get-foreground-color($cardBackground, rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.3));
$footerHeaderColor: get-foreground-color($cardBackground, rgba(0, 0, 0, 0.54), #fff);

.paging {
    text-align: right;
}

.select {
    background: $background;
    color: $foreground;
}

.table {
    background: $cardBackground;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    overflow-x: auto;

    &.table--without-footer .body .row:last-child {
        border-bottom: 0;
    }
}

.row {
    display: flex;
    justify-content: space-between;
    padding: 0 0.5rem;
    border-bottom: 1px solid $border;
}

.cell {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    padding: 2px 4px;

    &:empty {
        display: none;
    }

    &:nth-child(1) {
        max-width: 7.6rem;
        min-width: 30%;
    }

    &:nth-child(2) {
        max-width: 8.75rem;
        min-width: 8.75rem;
    }
    &:nth-child(6) {
        max-width: 5rem;
    }

    & > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        height: 22px;
        line-height: 22px;
    }
}

.table-list:empty {
    display: none;
}

.row:not(.header-row):not(.footer-row) {
    height: 3rem;

    &:hover {
        background-color: $hover;
    }
}

.row > .numeric-cell {
    justify-content: flex-end;
    flex-shrink: 1;
}

.header-row {
    font-weight: 600;
    color: $footerHeaderColor;
    height: 3.5rem;
}

.footer-row {
    height: 3rem;
}

.footer {
    color: $footerHeaderColor;

    & .row {
        border-bottom: none;
    }

    & .cell {
        display: flex;
        max-width: none !important;
    }

    & a {
        color: $theme;
        text-decoration: none;
    }
}

.paging {
    margin-top: 0.5rem;
}

.empty-content {
    text-align: center;

    & > button {
        margin: 1rem 0;
    }
}

@media (max-width: 520px) {
    .footer > .row {
        height: 4rem;
        padding: 0.75rem 0 0 0;
    }

    .footer > .row > .cell {
        display: block;
        padding: 0;
        text-align: center;
        height: 3rem;
    }
}
</style>
