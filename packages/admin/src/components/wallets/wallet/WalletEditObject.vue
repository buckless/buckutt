<template>
    <div>
        <b-detailedswitch
            label="Blocage du support"
            icon="lock"
            :value="focusedWallet.blocked"
            @input="updateAndSaveFocusedElement({ field: 'blocked', value: $event })"
        >
            Bloquer le support à l'utilisation au sein de l'événement.<br />
            <strong>Note:</strong> Peut mettre jusqu'à 5 minutes à être effectif, en fonction de
            l'état du réseau.
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
            this.updateDeepestFocusedElement(payload).then(() =>
                this.updateWallet(this.focusedWallet)
            );
        },

        updateWallet(wallet) {
            const fields = ['id', 'blocked'];

            this.updateObject({ route: 'wallets', value: pick(wallet, fields) })
                .then(() => this.notify({ message: 'La modification a bien été prise en compte' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la configuration du support',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedWallet: state => state.app.focusedElements[0]
        })
    }
};
</script>
