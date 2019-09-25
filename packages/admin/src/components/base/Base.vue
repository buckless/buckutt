<template>
    <div class="b-base">
        <b-objectlist
            :model="model"
            :icon="icon"
            :focusedElements="focusedElements"
            :fullPath="$route.fullPath"
            :objects="objects"
            :create="!!createTitle"
            :title="itemList.field"
            :subtitle="itemList.subtitle"
            :sort="itemList.sort"
            @search="search"
        ></b-objectlist>
        <router-view :key="focusedElements[0] ? focusedElements[0].id : $route.path" class="b-base-right"></router-view>
    </div>
</template>

<script>
import debounce from 'lodash.debounce';
import { mapState, mapGetters } from 'vuex';
import ObjectList from './object/ObjectList.vue';

export default {
    components: {
        'b-objectlist': ObjectList
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
        createTitle: {
            type: String,
            required: false
        },
        itemList: {
            type: Object,
            required: true
        },
        debounce: {
            type: String,
            required: false
        }
    },

    computed: {
        ...mapState({
            objectsRaw(state) {
                return state.api[this.model].allIds.map(id => state.api[this.model].values[id]);
            }
        }),

        ...mapGetters(['focusedElements']),

        objects() {
            const objects = this.objectsRaw.filter(
                object =>
                    !(
                        object[this.itemList.field] &&
                        this.itemList.hide &&
                        this.itemList.hide.indexOf(object[this.itemList.field]) > -1
                    )
            );

            if (this.model !== 'users') {
                return objects;
            }

            return objects.map(object => ({
                ...object,
                fullname: `${object.firstname} ${object.lastname}`
            }));
        }
    },

    methods: {
        search(input) {
            if (this.debounce) {
                this.$store.dispatch(this.debounce, { input });
            }
        }
    },

    mounted() {
        this.search('');
        const search = this.search;
        this.search = debounce(input => search(input), 500);
    }
};
</script>

<style scoped>
.b-base {
    display: flex;
}
</style>
