<template>
    <div class="home">
        <Mode @click.native="initializeSupport">
            <h2>Initialiser un support</h2>
            <p>Créer un support qui sera ré-assignable par la suite</p>
        </Mode>
        <Mode @click.native="anonSupport">
            <h2>Assigner un support anonyme</h2>
            <p>Créer un support qui <strong>ne sera pas</strong> ré-assignable par la suite</p>
        </Mode>
        <Mode @click.native="options">
            <h2>Gérer les options d'une carte</h2>
            <p>Gère les options (propres à votre évènement) d'une carte</p>
        </Mode>
    </div>
</template>

<script>
import Mode from '@/components/Mode';

export default {
    components: {
        Mode
    },

    methods: {
        initializeSupport() {
            this.$router.push('/initialize');
        },

        anonSupport() {
            this.$router.push('/anon');
        },

        options() {
            this.$router.push('/options');
        }
    }
};
</script>

<style scoped>
.home {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.home > .mode {
    margin-top: 12px;
}
</style>
