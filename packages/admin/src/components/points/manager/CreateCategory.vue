<template>
    <b-container dropShadow @close="back">
        <b-modal title="Ajouter une catégorie" @close="back" class="b-category-create">
            <div class="b-category-choose" v-if="!choice">
                <b-button @click="choice = 'link'">Lier une catégorie existante</b-button>
                <b-button @click="choice = 'create'">Créer une nouvelle catégorie</b-button>
            </div>
            <form v-else-if="choice === 'create'" @submit.prevent="create">
                <b-input
                    v-model="name"
                    label="Nom de la catégorie"
                    class="b-category-field"
                ></b-input>
            </form>
            <form v-else-if="choice === 'link'" @submit.prevent="create">
                <b-autocomplete
                    label="Nom de la catégorie"
                    v-model="category"
                    :suggestions="remainingCategoriesOptions"
                    class="b-category-field"
                ></b-autocomplete>
            </form>
            <template slot="actions">
                <b-button @click="back" v-if="!choice">Annuler</b-button>
                <b-button @click="choice = ''" v-else>Retour</b-button>
                <b-button raised accent @click="create" v-if="choice">Valider</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            choice: '',
            name: '',
            category: ''
        };
    },

    methods: {
        ...mapActions(['createObject', 'createRelation']),

        back() {
            this.$router.go(-1);
        },

        async create() {
            const category =
                this.choice === 'create'
                    ? await this.createObject({ route: 'categories', value: { name: this.name } })
                    : this.categories.values[this.category];

            return this.linkCategory(category);
        },

        async linkCategory(category) {
            await this.createRelation({
                obj1: {
                    route: 'points',
                    value: this.focusedPoint
                },
                obj2: {
                    route: 'categories',
                    value: category
                }
            });

            this.back();
        }
    },

    computed: {
        ...mapState({
            categories: state => state.api.categories
        }),

        ...mapGetters(['categoriesOptions', 'focusedElements']),

        focusedPoint() {
            return this.focusedElements[0];
        },

        remainingCategoriesOptions() {
            return this.categoriesOptions.filter(
                option =>
                    !(this.focusedPoint.categories || []).some(
                        category => category.id === option.id
                    )
            );
        }
    }
};
</script>

<style scoped>
.b-category-create {
    overflow: visible !important;
}

.b-category-choose {
    display: flex;
    flex-direction: column;
    justify-content: center;

    & > button {
        margin: 10px;
    }
}

form {
    & > .b-category-field {
        margin-top: 15px;
        display: block;
        width: 300px;
    }
}
</style>
