<template>
    <div>
        <span @click.capture="interceptEvent">
            <slot></slot>
        </span>

        <mdl-dialog ref="confirm" title="Suppression">
            <p>Êtes-vous sûr de vouloir effectuer cette action ?</p>
            <template slot="actions">
                <mdl-button primary @click.native="validate">Valider</mdl-button>
                <mdl-button @click.native="$refs.confirm.close">Annuler</mdl-button>
            </template>
        </mdl-dialog>
    </div>
</template>

<script>
export default {
    props: {
        disabled: Boolean
    },

    methods: {
        interceptEvent(e) {
            if (!this.disabled) {
                this.$refs.confirm.open();
            }

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        },

        validate() {
            this.$emit('confirm');
            this.$refs.confirm.close();
        }
    },

    beforeDestroy() {
        document.body.removeChild(this.$refs.confirm.$el);
    },

    mounted() {
        document.body.appendChild(this.$refs.confirm.$el);
    }
};
</script>
