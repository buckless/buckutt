<template>
    <div>
        <h5>Détails du moyen de paiement</h5>

        <b-list :elements="elements"></b-list>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedMeanOfPayment: state => state.app.focusedElements[0]
        }),

        elements() {
            const elements = [
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Nom',
                    content: this.focusedMeanOfPayment.name
                },
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Type',
                    content: this.focusedMeanOfPayment.type === 'unit' ? 'Consigne' : 'Numérique'
                }
            ];

            if (this.focusedMeanOfPayment.type === 'unit') {
                elements.push({
                    icon: 'keyboard_arrow_right',
                    title: "Valeur d'une unité",
                    type: 'price',
                    content: this.focusedMeanOfPayment.step
                });
            }

            return elements;
        }
    }
};
</script>
