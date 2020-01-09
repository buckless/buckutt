<template>
    <div class="b-details" :is="formType" @submit.prevent="update">
        <div class="b-details-list">
            <div
                class="b-details-list-entry"
                v-for="entry in list"
                :key="entry.field"
                v-if="entry.type !== 'hidden'"
            >
                <div class="b-details-list-entry-icon">
                    <b-icon :name="entry.icon" :size="44"></b-icon>
                </div>
                <div class="b-details-list-entry-content" v-if="!edition || entry.lockEdition">
                    <span class="b-details-list-entry-label">{{ entry.label }}</span>
                    <span class="b-details-list-entry-content-data" v-if="entry.type === 'date'"
                        >{{ data[entry.field] | date }}
                        <b-icon name="lock" :size="14" v-if="edition"></b-icon
                    ></span>
                    <span
                        class="b-details-list-entry-content-data"
                        v-else-if="entry.type === 'price'"
                        >{{ data[entry.field] | price(true) }}
                        <b-icon name="lock" :size="14" v-if="edition"></b-icon
                    ></span>
                    <span
                        class="b-details-list-entry-content-data"
                        v-else-if="entry.type === 'boolean'"
                        >{{ data[entry.field] ? 'Oui' : 'Non' }}
                        <b-icon name="lock" :size="14" v-if="edition"></b-icon
                    ></span>
                    <span
                        class="b-details-list-entry-content-data"
                        v-else-if="entry.type === 'password'"
                        >••••• <b-icon name="lock" :size="14" v-if="edition"></b-icon
                    ></span>
                    <span class="b-details-list-entry-content-data" v-else
                        >{{ data[entry.field]
                        }}<template v-if="entry.type === 'percent'"
                            >%</template
                        >
                        <b-icon name="lock" :size="14" v-if="edition"></b-icon
                    ></span>
                </div>
                <div class="b-details-list-entry-edit" v-else>
                    <template v-if="entry.type === 'boolean'">
                        <span class="b-details-list-entry-label">{{ entry.label }}</span><br />
                    </template>
                    <b-checkbox
                        v-model="cloneData[entry.field]"
                        :key="entry.field"
                        v-if="entry.type === 'boolean'"
                        ></b-checkbox
                    >
                    <b-datetimeinput
                        v-model="cloneData[entry.field]"
                        :label="entry.label"
                        v-else-if="entry.type === 'date'"
                        :key="entry.field"
                    ></b-datetimeinput>
                    <b-input
                        v-model="cloneData[entry.field]"
                        :label="entry.label"
                        type="password"
                        v-else-if="entry.type === 'password'"
                        :key="entry.field"
                        placeholder="Ne pas changer"
                    ></b-input>
                    <b-input
                        v-model="cloneData[entry.field]"
                        :label="entry.label"
                        v-else
                        :key="entry.field"
                    ></b-input>
                </div>
            </div>
        </div>
        <template v-if="edition">
            <b-dropzone
                v-if="hasImage && !newImage"
                @files="processImages"
                class="b-details-dropzone"
            ></b-dropzone>
            <div
                class="b-details-imagecontainer b-details-dropzone"
                v-if="hasImage && newImage"
                @click="newImage = null"
            >
                <img :src="newImage" alt="Image preview" class="b-details-image" />
                Cliquez ici pour changer d'image
            </div>
        </template>
        <div class="b-details-buttons">
            <b-confirm v-if="!edition && removable" @confirm="remove">
                <b-button>Supprimer</b-button>
            </b-confirm>
            <b-button raised v-if="!edition" @click="edit">Modifier</b-button>
            <b-button v-if="edition" @click="close" type="button">Annuler</b-button>
            <b-button raised accent v-if="edition" type="submit">Valider</b-button>
        </div>
    </div>
</template>

<script>
import bcrypt from 'bcryptjs';
import cloneDeep from 'lodash.clonedeep';
import '@/lib/date';
import '@/lib/price';

export default {
    props: {
        data: {
            type: Object,
            required: true
        },
        list: {
            type: Array,
            required: true
        },
        hasImage: {
            type: Boolean,
            required: true
        },
        image: {
            type: String,
            required: false
        },
        removable: {
            type: Boolean,
            required: false,
            default: true
        }
    },

    data() {
        return {
            cloneData: null,
            edition: false,
            newImage: null
        };
    },

    methods: {
        edit() {
            this.cloneData = cloneDeep(this.data);
            this.newImage = this.image;

            this.list
                .filter(entry => entry.type === 'password')
                .forEach(entry => {
                    this.cloneData[entry.field] = '';
                });

            this.list
                .filter(entry => entry.type === 'date')
                .forEach(entry => {
                    this.cloneData[entry.field] = new Date(this.cloneData[entry.field]);
                });

            this.list
                .filter(entry => entry.display)
                .forEach(entry => {
                    this.cloneData[entry.field] = entry.display(this.cloneData);
                });

            this.edition = true;
        },

        close() {
            this.cloneData = null;
            this.edition = false;
        },

        update() {
            this.list
                .filter(entry => entry.type === 'password' && !entry.lockEdition)
                .forEach(password => {
                    this.cloneData[password.field] = this.cloneData[password.field]
                        ? bcrypt.hashSync(this.cloneData[password.field], 10)
                        : undefined;
                });

            this.list
                .filter(entry => entry.compute && !entry.lockEdition)
                .forEach(entry => {
                    this.cloneData[entry.field] = entry.compute(this.cloneData);
                });

            this.$emit('update', this.cloneData, this.newImage);
            this.close();
        },

        remove() {
            this.$emit('remove', this.data);
        },

        processImages(images) {
            const reader = new FileReader();
            const file = images[images.length - 1];
            reader.readAsDataURL(file);
            reader.addEventListener('loadend', ({ target }) => {
                this.newImage = target.result;
            });
        }
    },

    computed: {
        formType() {
            return this.edition ? 'form' : 'div';
        }
    }
};
</script>

<style scoped>
.b-details {
    display: flex;
    flex-direction: column;
    align-items: center;

    & > .b-details-dropzone {
        margin: 10px;
    }

    & > .b-details-imagecontainer {
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

        & > .b-details-image {
            width: 80px;
            height: 80px;
            margin-right: 24px;
            border-radius: var(--radius);
        }
    }

    & > .b-details-list {
        width: 100%;
        display: flex;
        align-items: center;
        flex-wrap: wrap;

        & > .b-details-list-entry {
            display: flex;
            width: 230px;
            margin: 30px;

            & > .b-details-list-entry-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: var(--primary-200);
                color: #fff;
                padding: 8px;
                margin-right: 10px;
            }

            & > .b-details-list-entry-content {
                display: flex;
                flex-direction: column;
            }

            & > .b-details-list-entry-edit {
                & > label > div {
                    color: var(--primary-500);
                }
            }
        }
    }

    & > .b-details-buttons {
        display: flex;
        align-self: flex-end;
    }
}

.b-details-list-entry-label {
    font-size: var(--typography-body-2-size);
    letter-spacing: var(--typography-body-2-spacing);
    font-weight: var(--typography-body-2-weight);
    color: var(--primary-500);
}
</style>
