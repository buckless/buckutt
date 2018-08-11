<template>
    <div>
        <h5>Détails de l'offre</h5>

        <b-list :elements="elements"></b-list>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedGiftReload: state => state.app.focusedElements[0]
        }),

        elements() {
            return [
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Montant',
                    type: 'price',
                    content: this.focusedGiftReload.amount
                },
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Intervale',
                    type: 'price',
                    content: this.focusedGiftReload.everyAmount
                }
            ];
        }
    }
};
</script>
