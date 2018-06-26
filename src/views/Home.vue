<template>
    <div class="home">
        <Mode @click.native="options">
            <h2>Gérer les options d'une carte</h2>
            <p>Gère les options (propres à votre évènement) d'une carte</p>
        </Mode>
        <Mode @click.native="initialize = true" v-if="developertools">
            <h2>Initialiser un support</h2>
            <p>Créer un support qui sera ré-assignable par la suite (développeur !)</p>
        </Mode>
        <Mode @click.native="cardRead" v-if="developertools">
            <h2>Lire une carte</h2>
            <p>Lit une carte et affiche les informations inscrites (développeur !)</p>
        </Mode>
        <Mode @click.native="unlock" v-if="developertools">
            <h2>Enlever le code PIN</h2>
            <p>Supprime le code PIN d'une carte (développeur !)</p>
        </Mode>

        <label>
            <input type="checkbox" v-model="developertools">
            Activer les options développeur
        </label>

        <nfc
            mode="write"
            @read="initializeSupport"
            @cancel="initialize = false"
            successText="Carte initialisée"
            v-if="initialize"
            key="initialize"
            disableLockCheck
            disableSignCheck
            shouldPinLock>
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
            initialize: false,
            developertools: false
        };
    },

    methods: {
        initializeSupport() {
            window.app.$root.$emit('readyToWrite', 0, {
                assignedCard: false,
                catering: []
            });

            window.app.$root.$on('writeCompleted', () => {
                setTimeout(() => {
                    this.initialize = false;
                    this.$forceUpdate();

                    setTimeout(() => {
                        this.initialize = true;
                    }, 50);
                }, 400);
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
    },

    mounted() {
        if (sessionStorage.hasOwnProperty('masterapp-developertools')) {
            this.developertools = sessionStorage.getItem('masterapp-developertools') === 'true';
        }
    },

    watch: {
        developertools() {
            sessionStorage.setItem('masterapp-developertools', this.developertools);
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

.home > label {
    position: absolute;
    bottom: 20px;
}
</style>
