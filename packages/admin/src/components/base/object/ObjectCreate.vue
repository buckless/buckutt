<template>
    <b-container dropShadow @close="back">
        <b-modal :title="title" @close="back" class="b-modal-create">
            <form @submit.prevent="create" class="b-create">
                <template
                    v-for="entry in list"
                    v-if="!entry.lockCreation && entry.type !== 'hidden'"
                >
                    <b-checkbox
                        v-model="newData[entry.field]"
                        :key="entry.field"
                        v-if="entry.type === 'boolean'"
                        >{{ entry.label }}</b-checkbox
                    >
                    <b-datetimeinput
                        v-model="newData[entry.field]"
                        :label="entry.label"
                        v-else-if="entry.type === 'date'"
                        :key="entry.field"
                    ></b-datetimeinput>
                    <b-input
                        v-model="newData[entry.field]"
                        :label="entry.label"
                        type="password"
                        v-else-if="entry.type === 'password'"
                        :key="entry.field"
                    ></b-input>
                    <b-input
                        v-model="newData[entry.field]"
                        :label="entry.label"
                        v-else
                        :key="entry.field"
                    ></b-input>
                </template>
                <b-dropzone v-if="hasImage && !image" @files="processImages"></b-dropzone>
                <div class="b-create-imagecontainer" v-if="hasImage && image" @click="image = null">
                    <img :src="image" alt="Image preview" class="b-create-image" />
                    Cliquez ici pour changer d'image
                </div>
                <b-button v-show="false"></b-button>
            </form>
            <template slot="actions">
                <b-button @click="back">Annuler</b-button>
                <b-button raised accent @click="create">Valider</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import bcrypt from 'bcryptjs';

export default {
    props: {
        list: {
            type: Array,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        hasImage: {
            type: Boolean,
            required: true
        }
    },

    data() {
        return {
            newData: {},
            image: null,
            loadingImage: false
        };
    },

    methods: {
        create() {
            this.list
                .filter(entry => entry.type === 'password' && !entry.lockEdition)
                .forEach(password => {
                    this.newData[password.field] = this.newData[password.field]
                        ? bcrypt.hashSync(this.newData[password.field], 10)
                        : undefined;
                });

            this.list
                .filter(entry => entry.compute && !entry.lockCreation)
                .forEach(entry => {
                    this.newData[entry.field] = entry.compute(this.newData);
                });

            this.$emit('create', this.newData, this.image);
            this.back();
        },

        back() {
            this.$router.go(-1);
        },

        processImages(images) {
            const reader = new FileReader();
            const file = images[images.length - 1];
            reader.readAsDataURL(file);
            reader.addEventListener('loadend', ({ target }) => {
                this.image = target.result;
            });
        }
    },

    mounted() {
        const prepare = {};
        this.list.forEach(entry => {
            prepare[entry.field] = entry.default || (entry.type === 'boolean' ? false : '');
        });

        this.newData = prepare;
    }
};
</script>

<style>
.b-modal-create {
    overflow: visible !important;
}

.b-create {
    & > * {
        margin-top: 15px;
        display: block;

        &.b-create-imagecontainer {
            font-size: var(--typography-body-2-size);
            letter-spacing: var(--typography-body-2-spacing);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            padding: 0 30px;
            border: 1px solid var(--grey-300);
            width: 405px;
            height: 110px;
            cursor: pointer;
            background-color: var(--grey-100);
        }

        & > .b-create-image {
            width: 80px;
            height: 80px;
            margin-right: 24px;
            border-radius: var(--radius);
        }
    }
}
</style>
