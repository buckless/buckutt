<template>
    <div class="b-categories">
        <div class="b-categories-list">
            <template v-for="tab in displayedTabs">
                <router-link :to="tab.route" v-if="!tab.active" tag="div" :key="tab.route">
                    {{ tab.name }}
                </router-link>
                <div v-else class="b-categories-tab-active" :key="tab.route">
                    <template v-if="!changeName">
                        <span class="b-list-text">{{ tab.name }}</span>
                        <div>
                            <b-button
                                class="b-small-button"
                                @click="
                                    changeName = true;
                                    name = tab.name;
                                "
                                ><b-icon name="edit"
                            /></b-button>
                        </div>
                        <router-link tag="div" to="remove" append
                            ><b-button class="b-small-button"><b-icon name="delete"/></b-button
                        ></router-link>
                    </template>
                    <form @submit.prevent="editCategory" v-else>
                        <b-input small placeholder="Nom" v-model="name" :key="tab.route" />
                        <div>
                            <b-button class="b-small-button"><b-icon name="check"/></b-button>
                        </div>
                        <div>
                            <b-button class="b-small-button" @click.prevent="changeName = false"
                                ><b-icon name="close"
                            /></b-button>
                        </div>
                    </form>
                </div>
            </template>
            <router-link to="create" append tag="div">
                <b-icon name="add_circle_outline"></b-icon>
            </router-link>
        </div>
        <b-card class="b-categories-content">
            <router-view></router-view>
            <span v-if="!focusedCategory">Veuillez sélectionner ou créer une catégorie</span>
        </b-card>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import sortOrder from '@/lib/sortOrder';

export default {
    data: () => ({
        changeName: false,
        name: ''
    }),

    computed: {
        ...mapGetters(['focusedElements']),

        focusedPoint() {
            return this.focusedElements[0];
        },

        focusedCategory() {
            return this.focusedElements[1];
        },

        displayedTabs() {
            return (this.focusedPoint.categories || [])
                .sort((a, b) => sortOrder(a.name, b.name))
                .map(category => ({
                    active: this.focusedCategory && category.id === this.focusedCategory.id,
                    route: `/points/${this.focusedPoint.id}/categories/${category.id}`,
                    name: category.name
                }));
        }
    },

    methods: {
        ...mapActions(['updateObject']),

        editCategory() {
            this.updateObject({
                route: 'categories',
                value: { id: this.focusedCategory.id, name: this.name }
            });
            this.changeName = false;
        }
    },

    beforeRouteUpdate(_, __, next) {
        this.changeName = false;
        next();
    }
};
</script>

<style scoped>
.b-categories {
    max-width: 1200px !important;

    & > .b-categories-list {
        display: flex;
        margin: 0 30px;

        & > div {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 20px;
            cursor: pointer;

            &.b-categories-tab-active {
                background-color: #fff;
                border: 1px solid #ececec;
                border-bottom: 0px;
                border-radius: var(--radius);
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;

                & > form {
                    display: flex;
                    align-items: center;

                    & > label {
                        max-width: 80px;
                    }
                }
            }

            & > .b-list-text {
                margin-right: 10px;
            }
        }
    }

    & > .b-categories-content {
        margin-top: 0 !important;
    }
}

.b-small-button {
    padding: 0 5px !important;
}
</style>
