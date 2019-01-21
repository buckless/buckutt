<template>
    <div class="b-associate" v-if="!privateKey">
        <div class="b-associate__drop"></div>
        <div class="b-associate__modal">
            <h3 class="b-associate__modal__title">Associer l'équipement</h3>
            <div class="b-associate__modal__text">
                <span v-if="!error">
                    L'équipement n'est actuellement pas associé à votre serveur Cashless.<br />
                    Pour associer celui-ci, veuillez vous rendre dans votre espace d'administration et autoriser la connexion à l'équipement suivant:
                </span>
                <span v-else>
                    L'association a échoué, veuillez vous assurer de bien avoir autorisé la connexion à l'équipement suivant:
                </span>
                <br />
                <span class="b-associate__modal__device">{{ name }}</span>
            </div>
            <button
                class="b-associate__modal__validate"
                @click="validate">Valider</button>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            validating: false,
            error: false
        };
    },

    computed: mapState({
        privateKey: state => state.auth.device.privateKey,
        name: state => state.auth.device.name
    }),

    methods: {
        async validate() {
            if (this.validating) {
                return;
            }

            const authorized = await this.checkDevice();
            if (!authorized) {
                this.error = true;
            }
        },

        ...mapActions(['checkDevice'])
    }
};
</script>

<style scoped>
@import '../main.css';

.b-associate__drop {
    @add-mixin modal-drop;
    background-color: $black;
    opacity: 0.6;
    z-index: 999999;
}

.b-associate__modal {
    @add-mixin modal 500px;
    width: calc(100vw - 20px);
    max-width: 500px;
    z-index: 9999999;

    align-items: flex-start;
    display: flex;
    flex-direction: column;
    min-height: 100px;
}

.b-associate__modal__title {
    margin-top: 0;
}

.b-associate__modal__validate {
    background-color: #fff;
    border: 0;
    cursor: pointer;
    font-weight: bold;
    height: 36px;
    margin-top: 1em;
    padding: 0 16px;
    border-radius: 2px;
    font-size: 14px;
    text-transform: uppercase;
    width: 100%;

    &:active,
    &:focus,
    &:hover {
        background-color: color($black a(0.3));
    }
}

.b-associate__modal__device {
    font-weight: bold;
    font-size: 24px;
    text-align: center;
    width: 100%;
    display: inline-block;
    margin-top: 10px;
    font-family: monospace;
    letter-spacing: 3px;
}
</style>
