<template>
    <div>
        <h5>Créer une formule</h5>
        <form @submit.prevent="createPromotion(newPromotion)">
            <mdl-textfield floating-label="Nom" v-model="newPromotion.name"></mdl-textfield><br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newPromotion: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createPromotion(promotion) {
            this.createObject({ route: 'promotions', value: promotion })
                .then(createdPromotion => {
                    this.notify({ message: 'La formule a bien été créé' });
                    this.$router.push(`/promotions/${createdPromotion.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création de la formule',
                        full: err
                    })
                );
        }
    }
};
</script>
