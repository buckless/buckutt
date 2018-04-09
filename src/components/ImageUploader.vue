<template>
    <div class="b-imageUploader" @dragover.prevent="displaySave = true" @dragleave="displaySave = false" @drop="onDrop">
        <img :src="image" :alt="name" v-show="image" class="b-imageUploader__image" />
        <div class="b-imageUploader__image" v-show="!image"></div>
        <div class="b-imageUploader__note">
            <template v-if="!displaySave">Glissez une image ou appuyez sur le bouton Parcourir</template>
            <template v-else>
                <i class="material-icons">save</i>
                <span>Lâchez pour sauvegarder</span>
            </template>
        </div>
        <div class="b-imageUploader_over"></div>
        <mdl-tooltip target="add-button">Parcourir</mdl-tooltip>
        <mdl-button id="add-button" fab colored
            class="b-imageUploader__add mdl-js-ripple-effect">
          <i class="material-icons">attach_file</i>
          <input type="file" @change="onImageChange" accept="image/*" />
        </mdl-button>
    </div>
</template>

<script>
import { getImage, postImage } from '../lib/fetchImages';

export default {
    props: {
        id: String,
        name: String
    },

    data() {
        return {
            image: null,
            displaySave: false
        };
    },

    methods: {
        onDrop(event) {
            event.stopPropagation();
            event.preventDefault();
            this.displaySave = false;
            this.createImage(event.dataTransfer.files[0]);
        },
        onImageChange(event) {
            this.createImage(event.target.files[0]);
        },
        createImage(file) {
            const reader = new FileReader();

            reader.addEventListener('load', () => {
                this.image = reader.result;
                console.log(this.image);
                postImage(this.id, this.image)
                    .then(() => this.$emit('change', false))
                    .catch(err => this.$emit('change', err));
            });

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    },

    mounted() {
        getImage(this.id)
            .then(result => {
                this.image = result.image;
            })
            .catch(() => {
                this.image = null;
            });
    }
};
</script>

<style>
.b-imageUploader {
    background-image: url('../assets/placeholder.jpg');
    background-repeat: no-repeat;
    width: 150px;
    height: 150px;
    box-shadow: 0 0 2px color(#222 a(0.25)), 0 2px 3px color(#222 a(0.25));
    border-radius: 2px;

    & > .b-imageUploader__image {
        position: relative;
        width: 100%;
        height: 100%;
    }

    & > .b-imageUploader__note {
        display: flex;
        align-items: center;
        position: relative;
        width: 150px;
        height: 70px;
        background: rgba(0, 0, 0, 0.55);
        margin-top: -150px;
        margin-bottom: 80px;
        color: white;
        text-align: center;
        font-size: 13px;
        padding: 5px;

        & > i {
            font-size: 30px;
            margin: 5px;
        }

        & > span {
            flex: 1;
        }
    }

    /* Necessary to avoid strange dragover behaviour */
    & > .b-imageUploader_over {
        width: 150px;
        height: 150px;
        position: relative;
        margin-top: -150px;
    }

    & > .b-imageUploader__add {
        position: relative;
        top: -35px;
        left: 115px;

        & > input[type='file'] {
            cursor: pointer;
            height: 100%;
            right: 0;
            opacity: 0;
            position: absolute;
            top: 0;
            width: 100%;
            z-index: 4;
        }
    }
}
</style>
