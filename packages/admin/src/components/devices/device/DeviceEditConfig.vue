<template>
    <div>
        <h5>Configurer l'équipement</h5>
        <strong>Attention:</strong> Chaque modification sur cette page ne sera effective qu'en
        présence d'Internet.<br />
        <b-detailedswitch
            label="Équipement associé"
            icon="cast"
            :value="focusedDevice.authorized"
            @input="updateAndSaveFocusedElement({ field: 'authorized', value: $event })"
        >
            Autoriser l'équipement à vendre dans votre événement.
        </b-detailedswitch>

        <b-detailedswitch
            label="Badgeage avant achat"
            icon="done_all"
            :value="focusedDevice.doubleValidation"
            @input="updateAndSaveFocusedElement({ field: 'doubleValidation', value: $event })"
        >
            Oblige l'acheteur à badger une première fois, afin de permettre au vendeur de connaître
            les articles et tarifs disponibles pour celui-ci, ainsi que de connaître son solde ou
            vérifier son identité, avant de prendre sa commande. Si cette option n'est pas activée,
            les tarifs du groupe par défaut défini dans le point de vente sera utilisé.
        </b-detailedswitch>

        <b-detailedswitch
            label="Avertissement alcool"
            icon="local_drink"
            :value="focusedDevice.alcohol"
            @input="updateAndSaveFocusedElement({ field: 'alcohol', value: $event })"
        >
            Affiche un avertissement lors de la vente d'alcool à un utilisateur lorsque celui-ci a
            atteint ou dépassé la limite d'unité alcool définie pour l'événement.
        </b-detailedswitch>

        <b-detailedswitch
            label="Afficher l'image utilisateur"
            icon="person"
            :value="focusedDevice.showPicture"
            @input="updateAndSaveFocusedElement({ field: 'showPicture', value: $event })"
        >
            Affiche l'image personnelle (avatar) de l'utilisateur ayant badgé, lorsque que le
            badgeage avant achat est activé.
        </b-detailedswitch>
    </div>
</template>

<script>
import pick from 'lodash.pick';
import { mapState, mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['updateObject', 'updateDeepestFocusedElement', 'notify', 'notifyError']),

        updateAndSaveFocusedElement(payload) {
            const sendPrivateKey = payload.field === 'authorized' && payload.value;

            this.updateDeepestFocusedElement(payload)
                .then(() =>
                    payload.field === 'authorized'
                        ? this.updateDeepestFocusedElement({
                              field: 'sendPrivateKey',
                              value: sendPrivateKey
                          })
                        : Promise.resolve()
                )
                .then(() => this.updateDevice(this.focusedDevice));
        },

        updateDevice(device) {
            console.log(device);
            const fields = [
                'id',
                'authorized',
                'sendPrivateKey',
                'doubleValidation',
                'alcohol',
                'showPicture'
            ];

            this.updateObject({ route: 'devices', value: pick(device, fields) })
                .then(() => this.notify({ message: 'La modification a bien été prise en compte' }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la configuration de l'équipement",
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
