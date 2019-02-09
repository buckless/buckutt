<template>
    <div>
        <h5>Créer une offre de rechargement</h5>
        <form @submit.prevent="createGiftReload(newGiftReload)">
            <mdl-textfield
                floating-label="Montant offert (en centimes)"
                v-model="newGiftReload.amount"
                required="required"
                pattern="[0-9]+"
                error="Le montant doit être un entier"
            ></mdl-textfield
            ><br />
            <mdl-textfield
                floating-label="Tous les (en centimes)"
                v-model="newGiftReload.everyAmount"
                required="required"
                pattern="[0-9]+"
                error="Le montant doit être un entier"
            ></mdl-textfield
            ><br />
            <mdl-textfield
                floating-label="Montant minimal (en centimes)"
                v-model="newGiftReload.minimalAmount"
                required="required"
                pattern="[0-9]+"
                error="Le montant doit être un entier"
            ></mdl-textfield
            ><br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newGiftReload: {
                everyAmount: '',
                amount: '',
                minimalAmount: 0
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createGiftReload(giftReload) {
            this.createObject({ route: 'giftreloads', value: giftReload })
                .then(createdGiftReload => {
                    this.notify({ message: "L'offre a bien été créée" });
                    this.$router.push(`/giftreloads/${createdGiftReload.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création de la fondation',
                        full: err
                    })
                );
        }
    }
};
</script>
