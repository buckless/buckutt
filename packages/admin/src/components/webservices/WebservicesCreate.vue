<template>
    <div>
        <h5>Créer un webhook</h5>
        <p>
            <strong>Note:</strong> Un webbook est une adresse sur laquelle sera envoyée l'ensemble
            des achats effectués sur votre instance du système.
        </p>
        <form @submit.prevent="createWebservice(newWebservice)">
            <mdl-textfield
                floating-label="Adresse"
                v-model="newWebservice.url"
                required="required"
                error="L'adresse doit contenir au moins un caractère"
            ></mdl-textfield>
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
            newWebservice: {
                url: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),
        createWebservice(webservice) {
            this.createObject({ route: 'webservices', value: webservice })
                .then(createdWebservice => {
                    this.notify({ message: 'Le webhook a bien été créé' });
                    this.$router.push(`/webservices/${createdWebservice.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création du webhook',
                        full: err
                    })
                );
        }
    }
};
</script>
