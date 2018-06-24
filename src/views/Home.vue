<template>
    <div class="home">
        <Mode @click.native="options">
            <h2>Gérer les options d'une carte</h2>
            <p>Gère les options (propres à votre évènement) d'une carte</p>
        </Mode>
        <Mode @click.native="initialize = true">
            <h2>Initialiser un support</h2>
            <p>Créer un support qui sera ré-assignable par la suite (développeur !)</p>
        </Mode>
        <Mode @click.native="cardRead">
            <h2>Lire une carte</h2>
            <p>Lit une carte et affiche les informations inscrites (développeur !)</p>
        </Mode>
        <Mode @click.native="unlock">
            <h2>Enlever le code PIN</h2>
            <p>Supprime le code PIN d'une carte (développeur !)</p>
        </Mode>

        <nfc
            mode="write"
            @read="initializeSupport"
            @cancel="initialize = false"
            successText="Carte initialisée"
            v-if="initialize"
            key="initialize"
            disableSignCheck>
            Mode: initialisation
        </nfc>
    </div>
</template>

<script>
import Mode from '@/components/Mode';
import Nfc from '@/components/Nfc';

export default {
    components: {
        Mode,
        Nfc
    },

    data() {
        return {
            initialize: false
        };
    },

    methods: {
        initializeSupport() {
            window.app.$root.$emit('readyToWrite', 0, {
                assignedCard: false,
                catering: []
            });
        },

        options() {
            this.$router.push('/options');
        },

        cardRead() {
            this.$router.push('/cardRead');
        },

        unlock() {
            this.$router.push('/unlock');
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
