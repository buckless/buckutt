<template>
    <div class="b-config" v-if="!api || changeApi">
        <div class="b-config__drop" @click="close"></div>
        <div class="b-config__modal">
            <h3 class="b-config__modal__title">Associer l'équipement (1/2)</h3>
            <span v-if="error" class="b-config__modal__warning">Impossible de joindre ce serveur.</span>
            <span v-else-if="queueFilled || cancellationsFilled" class="b-config__modal__warning">Attention, les données non communiquées au serveur seront perdues.</span>
            <form @submit.prevent="validate">
                <div class="b-config__modal__text">
                    Veuillez rentrer l'identifiant de votre espace cashless afin d'y connecter l'équipement:<br />
                    <input type="text" class="b-config__modal__input" v-model="apiValue" />
                </div>
                <button class="b-config__modal__validate">Valider</button>
            </form>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            apiValue: '',
            error: false
        };
    },

    computed: mapState({
        api: state => state.device.api,
        changeApi: state => state.device.changeApi,
        queueFilled: state => state.online.offline.queue.filled,
        cancellationsFilled: state => state.history.pendingCancellations.length > 0
    }),

    methods: {
        ...mapActions(['setApi', 'startChangeApi', 'checkApi']),

        validate() {
            if (!this.apiValue) {
                return;
            }

            const isFullAdress = this.apiValue.indexOf('.') > -1;
            const fullApi = isFullAdress
                ? this.apiValue
                : process.env.VUE_APP_ROOTURL.replace('{slug}', this.apiValue);

            if (this.api === `${fullApi}/api/v1`) {
                this.close();
                return;
            }

            this.checkApi(`${fullApi}/api/v1`)
                .then(() => {
                    this.close();
                    this.setApi(`${fullApi}/api/v1`);
                })
                .catch(() => {
                    this.error = true;
                });
        },

        close() {
            this.error = false;
            this.startChangeApi(false);
        }
    }
};
</script>

<style scoped>
@import '../main.css';

.b-config__drop {
    @add-mixin modal-drop;
    background-color: $black;
    opacity: 0.6;
    z-index: 999999;
}

.b-config__modal {
    @add-mixin modal 500px;
    width: calc(100vw - 20px);
    max-width: 500px;
    z-index: 9999999;

    align-items: flex-start;
    display: flex;
    flex-direction: column;
    min-height: 100px;
}

.b-config__modal__title {
    margin-top: 0;
}

.b-config__modal__warning {
    color: $red;
    font-weight: 400;
    margin-bottom: 10px;
}

.b-config__modal__input {
    background-color: #fff;
    border: 0px;
    border-bottom: 1px solid black;
    width: 100%;
    height: 36px;
    font-size: 16px;
    padding-left: 10px;
    padding-right: 10px;
    outline: none;
    margin-top: 5px;
}

.b-config__modal__validate {
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
</style>
