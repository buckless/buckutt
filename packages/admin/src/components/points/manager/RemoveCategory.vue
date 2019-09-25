<template>
    <b-container dropShadow @close="back">
        <b-modal title="Supprimer une catégorie" @close="back" class="b-category-create">
            <div class="b-category-choose">
                <b-button @click="unlinkCategory">Enlever la catégorie du guichet</b-button>
                <b-confirm @confirm="remove"><b-button>Supprimer la catégorie</b-button></b-confirm>
            </div>
            <template slot="actions">
                <b-button @click="back">Retour</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['removeRelation', 'removeObject']),

        back() {
            this.$router.go(-1);
        },

        async remove() {
            await this.removeObject({ route: 'categories', value: this.focusedCategory });

            this.back();
        },

        async unlinkCategory() {
            await this.removeRelation({
                obj1: {
                    route: 'points',
                    value: this.focusedPoint
                },
                obj2: {
                    route: 'categories',
                    value: this.focusedCategory
                }
            });

            this.back();
        }
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedPoint() {
            return this.focusedElements[0];
        },

        focusedCategory() {
            return this.focusedElements[1];
        }
    }
};
</script>

<style scoped>
.b-category-choose {
    display: flex;
    flex-direction: column;
    justify-content: center;

    & > button,
    & > div {
        margin: 10px;
        text-align: center;
    }
}
</style>
