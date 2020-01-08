<template>
    <b-objectdetails
        :data="focusedElement"
        :list="list"
        :hasImage="hasImage"
        :image="image"
        :key="focusedElement.id"
        :removable="removable"
        @update="updateElement"
        @remove="removeElement"
    ></b-objectdetails>
</template>

<script>
import pick from 'lodash.pick';
import { mapGetters, mapActions } from 'vuex';
import ObjectDetails from './object/ObjectDetails.vue';
import { getImage, postImage } from '../../lib/fetchImages';

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
        hasImage: {
            type: Boolean,
            required: false,
            default: false
        },
        removable: {
            type: Boolean,
            required: false,
            default: true
        },
        notifications: {
            type: Object,
            default: () => ({
                error: 'Erreur inconnue'
            })
        }
    },

    data() {
        return {
            image: null
        };
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
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

                if (image) {
                    await postImage(element.id, image);
                    this.fetchImage();
                }

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
        },

        async fetchImage() {
            if (this.hasImage) {
                this.image = (await getImage(this.focusedElement.id)).image;
            }
        }
    },

    mounted() {
        this.fetchImage();
    }
};
</script>
