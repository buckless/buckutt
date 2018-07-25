<template>
    <div>
        <h5>Détails de l'équipement</h5>
        <b-list :elements="elements" :columns="3"></b-list>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedDevice: state => state.app.focusedElements[0]
        }),

        elements() {
            const elements = [
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Nom',
                    content: this.focusedDevice.name
                },
                {
                    icon: 'perm_device_information',
                    title: 'Équipement administrateur',
                    content: this.focusedDevice.isUser ? 'Oui' : 'Non'
                },
                {
                    icon: 'security',
                    title: 'Clé unique',
                    content: this.focusedDevice.fingerprint
                }
            ];

            if (!this.focusedDevice.isUser) {
                elements.push(
                    {
                        icon: 'done_all',
                        title: 'Badgeage avant achat',
                        content: this.focusedDevice.doubleValidation ? 'Activé' : 'Désactivé'
                    },
                    {
                        icon: 'local_drink',
                        title: 'Avertissement alcool',
                        content: this.focusedDevice.alcohol ? 'Activé' : 'Désactivé'
                    },
                    {
                        icon: 'person',
                        title: "Afficher l'image utilisateur",
                        content: this.focusedDevice.showPicture ? 'Activé' : 'Désactivé'
                    }
                );
            }

            return elements;
        }
    }
};
</script>
