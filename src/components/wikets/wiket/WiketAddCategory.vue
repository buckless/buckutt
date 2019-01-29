<template>
    <div class="b-addarticle">
        <h5>Ajout d'une catégorie au guichet</h5>
        <div class="b-addarticle__form">
            <form @submit.prevent="createCategory(newCategory)" class="b-addarticle__option">
                <h6>Créer une nouvelle catégorie:</h6>
                <mdl-textfield floating-label="Nom" v-model="newCategory.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>
                <mdl-button raised colored>Créer</mdl-button>
            </form>
            <form @submit.prevent="addCategory(category)" class="b-addarticle__option">
                <h6>Ajouter une catégorie existante:</h6>
                <b-inputselect label="Catégorie à ajouter" id="category-select" :options="remainingCategoryOptions" v-model="category"></b-inputselect>
                <mdl-button raised colored>Ajouter</mdl-button>
            </form>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import sortOrder from '../../../lib/sortOrder';

export default {
    data() {
        return {
            category: '',
            newCategory: {
                name: ''
            }
        };
    },

    computed: {
        ...mapState({
            focusedPoint: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['categoryOptions']),

        remainingCategoryOptions() {
            return this.categoryOptions
                .filter(
                    option =>
                        !(this.focusedPoint.categories || []).find(
                            category => category.id === option.value.id
                        )
                )
                .sort((a, b) => sortOrder(a.value.name, b.value.name));
        }
    },

    methods: {
        ...mapActions(['createObject', 'createRelation', 'notify', 'notifyError']),

        createCategory(category) {
            this.createObject({ route: 'categories', value: category })
                .then(createdCategory => {
                    this.notify({ message: 'La catégorie a bien été créé' });
                    this.newCategory = {
                        name: ''
                    };

                    return this.addCategory(createdCategory);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création de la catégorie',
                        full: err
                    })
                );
        },

        addCategory(category) {
            this.createRelation({
                obj1: {
                    route: 'points',
                    value: this.focusedPoint
                },
                obj2: {
                    route: 'categories',
                    value: category
                }
            })
                .then(() => {
                    this.notify({ message: 'La catégorie a bien été assignée au point' });
                    this.category = '';
                })
                .catch(err =>
                    this.notifyError({
                        message: "La catégorie n'a pas pu être assignée au point",
                        full: err
                    })
                );
        }
    }
};
</script>

<style>
.b-addarticle {
    & > .b-addarticle__form {
        display: flex;
        flex-wrap: wrap;

        & > .b-addarticle__option {
            min-width: 470px;

            & > button {
                margin-left: 20px;
            }
        }
    }
}
</style>
