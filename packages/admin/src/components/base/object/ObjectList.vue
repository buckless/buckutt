<template>
    <div class="b-container-list">
        <div class="b-container-list-search">
            <b-searchinput
                placeholder="Rechercher..."
                v-model="name"
                @input="search"
            ></b-searchinput>
            <b-button raised :to="`${this.fullPath}/create`" v-if="create">Nouveau</b-button>
        </div>
        <div class="b-container-list-content">
            <b-listitem
                v-for="object in displayedObjects"
                :key="object.id"
                :icon="icon"
                :title="object[title]"
                :subtitle="subtitle(object)"
                :to="`/${model}/${object.id}`"
                :active="isActive(object)"
            ></b-listitem>
            <p v-if="displayedObjects.length === 0">
                Aucun élément à afficher.
            </p>
        </div>
    </div>
</template>

<script>
import fuzzy from 'fuzzy';
import sortOrder from '@/lib/sortOrder';

export default {
    props: {
        model: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: false,
            default: 'name'
        },
        create: {
            type: Boolean,
            required: false,
            default: true
        },
        focusedElements: {
            type: Array,
            required: true
        },
        fullPath: {
            type: String,
            required: true
        },
        objects: {
            type: Array,
            required: true
        },
        subtitle: {
            type: Function,
            required: false,
            default: () => undefined
        },
        sort: {
            type: Function,
            required: false,
            default: function(a, b) { return sortOrder(a[this.title], b[this.title]) }
        }
    },

    data() {
        return {
            name: ''
        };
    },

    computed: {
        displayedObjects() {
            return fuzzy
                .filter(this.name, this.objects.filter(obj => obj[this.title]), {
                    extract: el => el[this.title]
                })
                .map(d => d.original)
                .sort((a, b) => this.sort(a, b));
        }
    },

    methods: {
        isActive(object) {
            return this.focusedElements.some(element => element.id === object.id);
        },

        search() {
            this.$emit('search', this.name);
        }
    }
};
</script>

<style>
.b-container-list {
    width: 340px;
    height: 100%;
    background-color: #e9e9e9;
    display: flex;
    flex-direction: column;

    & > .b-container-list-search {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        padding: 20px;
        min-height: 80px;

        & > div {
            flex: 1;
        }

        & > a {
            margin-left: 20px;
        }
    }

    & > .b-container-list-content {
        overflow-y: auto;
        flex-grow: 1;

        & > p {
            text-align: center;
        }
    }
}
</style>
