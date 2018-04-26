<template>
    <div>
        <h5>Génération du certificat SSL</h5>
        <form @submit.prevent="generateCert(focusedDevice, password)">
            <mdl-textfield :disabled="working" type="password" floating-label="Mot de passe souhaité" v-model="password"></mdl-textfield>
            <mdl-button :disabled="working" colored raised>Générer</mdl-button>
            <p v-show="working">
                Génération du certificat en cours...
            </p>
        </form>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { saveAs } from 'file-saver';
import { download } from '../../../lib/fetch';

export default {
    data() {
        return {
            working: false,
            password: ''
        };
    },

    methods: {
        ...mapActions(['notify', 'notifyError']),

        generateCert(device, password) {
            this.working = true

            download(`services/certificate?deviceId=${device.id}&password=${password}`)
                .then(result => {
                    this.notify({ message: 'Le téléchargement du certificat va démarrer...' });
                    saveAs(result, `${device.name}.p12`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la génération du certificat',
                        full: err
                    })
                )
                .then(() => {
                    this.working = false;
                });
        }
    },

    computed: {
        ...mapState({
            focusedDevice: state => state.app.focusedElements[0]
        })
    }
};
</script>
