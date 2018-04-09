<template>
    <div>
        <h5>Créer un guichet</h5>
        <form @submit.prevent="createPoint(newPoint)">
            <mdl-textfield floating-label="Nom" v-model="newPoint.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>
            <br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newPoint: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createPoint(point) {
            this.createObject({ route: 'points', value: point })
                .then(createdPoint => {
                    this.notify({ message: 'Le guichet a bien été créé' });
                    this.$router.push(`/points/${createdPoint.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création du guichet',
                        full: err
                    })
                );
        }
    }
};
</script>
