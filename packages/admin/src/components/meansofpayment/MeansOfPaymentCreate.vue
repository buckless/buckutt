<template>
    <div>
        <h5>Ajouter un moyen de paiement</h5>
        <form @submit.prevent="createMeanOfPayment(newMeanOfPayment)">
            <mdl-textfield
                floating-label="Nom"
                v-model="newMeanOfPayment.name"
                required="required"
                error="Le nom doit contenir au moins un caractère"
            ></mdl-textfield
            ><br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import slugify from 'slugify';
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newMeanOfPayment: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createMeanOfPayment(meanOfPayment) {
            this.createObject({
                route: 'meansofpayment',
                value: {
                    ...meanOfPayment,
                    slug: slugify(meanOfPayment.name, { lower: true })
                }
            })
                .then(createdMeanOfPayment => {
                    this.notify({ message: 'Le moyen de paiement a bien été créé' });
                    this.$router.push(`/meansofpayment/${createdMeanOfPayment.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création du moyen de paiement',
                        full: err
                    })
                );
        }
    }
};
</script>
