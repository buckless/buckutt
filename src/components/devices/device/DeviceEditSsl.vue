<template>
    <div>
        <h5>Génération du certificat SSL</h5>
        <form @submit.prevent="generateCert(focusedDevice, password)">
            <mdl-textfield type="password" floating-label="Mot de passe souhaité" v-model="password"></mdl-textfield>
            <mdl-button colored raised>Générer</mdl-button>
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
            password: ''
        };
    },

    methods: {
        ...mapActions(['notify', 'notifyError']),

        generateCert(device, password) {
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
                );
        }
    },

    computed: {
        ...mapState({
            focusedDevice: state => state.app.focusedElements[0]
        })
    }
};
</script>
