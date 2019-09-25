<template>
    <b-objectcreate
        :list="list"
        :title="createTitle"
        :hasImage="hasImage"
        @create="create"
    ></b-objectcreate>
</template>

<script>
import { mapActions } from 'vuex';
import ObjectCreate from './object/ObjectCreate.vue';
import { postImage } from '../../lib/fetchImages';

export default {
    components: {
        'b-objectcreate': ObjectCreate
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
        createTitle: {
            type: String,
            required: true
        },
        hasImage: {
            type: Boolean,
            required: false,
            default: false
        },
        notifications: {
            type: Object,
            default: {
                error: 'Erreur inconnue'
            }
        }
    },

    methods: {
        ...mapActions(['createObject', 'createUser', 'notify']),

        async create(element, image) {
            try {
                const object =
                    this.model === 'users'
                        ? await this.createUser(element)
                        : await this.createObject({ route: this.model, value: element });

                if (image) {
                    postImage(object.id, image);
                }

                this.notify(this.notifications.create);
            } catch {
                this.notify(this.notifications.error);
            }
        }
    }
};
</script>
