<template>
    <b-objectdetails
        :data="data"
        :list="list"
        :key="model"
        :hasImage="false"
        :removable="false"
        @update="updateElement"
        @remove="removeElement"
    ></b-objectdetails>
</template>

<script>
import pick from 'lodash.pick';
import { mapGetters, mapActions } from 'vuex';
import ObjectDetails from '../base/object/ObjectDetails.vue';

export default {
    components: {
        'b-objectdetails': ObjectDetails
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
        removable: {
            type: Boolean,
            required: false,
            default: true
        },
        notifications: {
            type: Object,
            default: {
                error: 'Erreur inconnue'
            }
        }
    },
    computed: {
        ...mapGetters(['event']),

        data() {
            if (this.model === 'periods') {
                return this.event.defaultPeriod;
            }

            return this.event;
        }
    },

    methods: {
        ...mapActions(['updateObject', 'removeObject', 'notify']),

        async updateElement(element, image) {
            try {
                const fields = ['id'].concat(
                    this.list.filter(entry => !entry.lockEdition).map(entry => entry.field)
                );
                await this.updateObject({ route: this.model, value: pick(element, fields) });

                this.notify(this.notifications.edit);
            } catch {
                this.notify(this.notifications.error);
            }
        },

        async removeElement(element) {
            try {
                await this.removeObject({ route: this.model, value: element });
                this.$router.push(`/${this.model}`);

                this.notify(this.notifications.delete);
            } catch {
                this.notify(this.notifications.error);
            }
        }
    }
};
</script>
