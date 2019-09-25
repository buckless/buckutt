<template>
    <b-objectedit
        :list="list"
        :title="editTitle"
        :data="focusedElement"
        :key="focusedElement.id"
        @edit="edit"
    ></b-objectedit>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ObjectEditModal from './object/ObjectEditModal.vue';

export default {
    components: {
        'b-objectedit': ObjectEditModal
    },

    props: {
        model: {
            type: String,
            required: true
        },
        list: {
            type: Array,
            required: true
        },
        editTitle: {
            type: String,
            required: true
        },
        notifications: {
            type: Object,
            default: {
                error: 'Erreur inconnue'
            }
        }
    },

    methods: {
        ...mapActions(['updateObject', 'notify']),

        async edit(element) {
            try {
                await this.updateObject({ route: this.model, value: element });
                this.notify(this.notifications.edit);
            } catch {
                this.notify(this.notifications.error);
            }
        }
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
        }
    }
};
</script>
