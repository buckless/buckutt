<template>
    <div>
        <span @click.capture="interceptEvent">
            <slot></slot>
        </span>

        <b-container dropShadow @close="close" v-if="opened">
            <b-modal title="Suppression" @close="close">
                <p>Êtes-vous sûr de vouloir effectuer cette action ?</p>
                <template slot="actions">
                    <b-button @click="close">Annuler</b-button>
                    <b-button raised @click="validate">Valider</b-button>
                </template>
            </b-modal>
        </b-container>
    </div>
</template>

<script>
export default {
    props: {
        disabled: Boolean
    },

    data() {
        return {
            opened: false
        };
    },

    methods: {
        interceptEvent(e) {
            if (!this.disabled) {
                this.opened = true;
            }

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        },

        validate() {
            this.$emit('confirm');
            this.close();
        },

        close() {
            this.opened = false;
        }
    }
};
</script>
