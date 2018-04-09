<template>
    <div class="b-addarticle">
        <h5>Ajout d'une catégorie au guichet</h5>
        <form @submit.prevent="addCategory(category)">
            <b-inputselect label="Catégorie à ajouter" id="category-select" :options="remainingCategoryOptions" v-model="category"></b-inputselect>
            <mdl-button raised colored>Ajouter</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import sortOrder from '../../../lib/sortOrder';

export default {
    data() {
        return {
            category: ''
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
        ...mapActions(['createRelation', 'notify', 'notifyError']),

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
                        message: "La catégore n'a pas pu être assignée au point",
                        full: err
                    })
                );
        }
    }
};
</script>
