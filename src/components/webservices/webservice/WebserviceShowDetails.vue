<template>
    <div>
        <h5>Détails du webhook</h5>

        <b-list :elements="elements"></b-list>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedWebservice: state => state.app.focusedElements[0]
        }),
        elements() {
            return [
                {
                    icon: 'link',
                    title: 'url',
                    content: this.focusedWebservice.url
                }
            ];
        }
    }
};
</script>
