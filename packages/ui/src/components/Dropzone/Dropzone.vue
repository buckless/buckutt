<template>
    <div
        :class="dropClasses"
        @dragenter="onDragenter"
        @dragleave="onDragleave"
        @dragover="onDragover"
        @drop="onDrop"
        ref="dropzone"
    >
        <div class="preview">
            <Icon name="add_photo_alternate" />
        </div>
        <div class="text">
            Déposez votre image sur cette zone
        </div>
        <input type="file" @change="onBrowse" accept="image/*" class="input" />
    </div>
</template>

<script>
import Icon from '../Icon/Icon';

export default {
    name: 'Dropzone',

    components: {
        Icon
    },

    data: () => ({ active: false }),

    computed: {
        dropClasses() {
            return {
                dropzone: true,
                active: this.active
            };
        }
    },

    methods: {
        onDragenter() {
            this.active = true;
        },

        onDragleave() {
            this.active = false;
        },

        onDragover(e) {
            e.preventDefault();
        },

        onDrop(e) {
            this.active = false;

            if (!e.dataTransfer) {
                return;
            }

            this.$emit('files', e.dataTransfer.files);
        },

        onBrowse(e) {
            this.active = false;

            this.$emit('files', e.target.files);
        }
    }
};
</script>

<style scoped>
.dropzone {
    position: relative;
    display: flex;
    height: 110px;
    width: 405px;
    align-items: center;
    padding: 0 30px;
    background-color: var(--grey-100);
    border-radius: var(--radius);
    background-image: url('../../assets/dashed.png');
    background-size: 100%;
    color: var(--foreground-dark-300);
}

.dropzone.active {
    background-image: none;
    border: 1px solid var(--primary-300);
}

.preview {
    display: flex;
    min-width: 80px;
    height: 80px;
    align-items: center;
    justify-content: center;
    margin-right: 24px;
    background-color: var(--grey-200);
    border-radius: var(--radius);
    /* used to disable dragleave to be called when hovering child */
    pointer-events: none;
}

.text {
    font-size: var(--typography-body-2-size);
    letter-spacing: var(--typography-body-2-spacing);
    /* used to disable dragleave to be called when hovering child */
    pointer-events: none;
}

.input {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
}
</style>
