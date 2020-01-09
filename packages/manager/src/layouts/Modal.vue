<template>
    <Container dropShadow @close="back">
        <Modal :title="title" @close="back" class="modal">
            <slot />

            <template slot="actions">
                <slot name="actions" />
            </template>
        </Modal>
    </Container>
</template>

<script>
import Container from 'ui/src/components/Modal/Container';
import Modal from 'ui/src/components/Modal/Modal';

export default {
    components: {
        Container,
        Modal
    },

    props: {
        title: {
            type: String,
            required: true
        }
    },

    methods: {
        back() {
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.modal {
    overflow: visible !important;
}
</style>
