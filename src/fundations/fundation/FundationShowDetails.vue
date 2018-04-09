<template>
    <div>
        <h5>Détails de la fondation</h5>

        <b-list :elements="elements"></b-list>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedFundation: state => state.app.focusedElements[0]
        }),

        elements() {
            return [
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Nom',
                    content: this.focusedFundation.name
                }
            ];
        }
    }
};
</script>
