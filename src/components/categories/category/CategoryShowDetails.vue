<template>
    <div>
        <h5>Détails de la catégorie</h5>
        <b-list :elements="elements"></b-list>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedCategory: state => state.app.focusedElements[0]
        }),

        elements() {
            return [
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Nom',
                    content: this.focusedCategory.name
                }
            ];
        }
    }
};
</script>
