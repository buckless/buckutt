<template>
    <div class="b-devices-options">
        <div class="b-devices-options-warning">
            <strong>Attention:</strong> Chaque modification sur cette page ne sera effective qu'en
            présence d'Internet.
        </div>
        <b-dswitch
            label="Équipement associé"
            icon="cast"
            v-model="options.authorized"
            @change="updateElement"
        >
            Autoriser l'équipement à vendre dans votre événement.
        </b-dswitch>

        <b-dswitch
            label="Badgeage avant achat"
            icon="done_all"
            v-model="options.doubleValidation"
            @change="updateElement"
        >
            Oblige l'acheteur à badger une première fois, pour accéder à ses tarifs. Sinon, les
            tarifs du groupe par défaut seront affichés.
        </b-dswitch>

        <b-dswitch
            label="Avertissement alcool"
            icon="local_drink"
            v-model="options.alcohol"
            @change="updateElement"
        >
            Affiche un avertissement lors de la vente d'alcool à un utilisateur lorsque celui-ci a
            atteint ou dépassé la limite d'unité alcool définie.
        </b-dswitch>
    </div>
</template>

<script>
import pick from 'lodash.pick';
import cloneDeep from 'lodash.clonedeep';
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            options: {}
        };
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
        }
    },

    methods: {
        ...mapActions(['updateObject', 'notify']),

        async updateElement() {
            const fields = ['id', 'authorized', 'doubleValidation', 'alcohol', 'sendPrivateKey'];
            this.options.sendPrivateKey =
                this.focusedElement.sendPrivateKey ||
                (!this.focusedElement.authorized && this.options.authorized);

            try {
                await this.updateObject({ route: 'devices', value: pick(this.options, fields) });
                this.notify("L'option a bien été mise à jour");
            } catch {
                this.notify('Une erreur a eu lieu lors de la modification des options');
            }
        }
    },

    mounted() {
        this.options = cloneDeep(this.focusedElement);
    }
};
</script>

<style>
.b-devices-options-warning {
    margin: 5px 0;
    text-align: center;
}
</style>
