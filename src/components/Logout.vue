<template>
    <div>
        Déconnexion en cours...
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['logoutUser'])
    },

    mounted() {
        this.logoutUser();
        this.$router.push('/');
    }
};
</script>
