<template>
    <div class="reload-status">
        <Card>
            <h3 class="title">{{ $t('register.title') }}</h3>
            <p v-if="status === 'success'">{{ $t('register.status.success') }}</p>
            <p v-else>{{ $t('register.status.fail') }}</p>
            <div class="actions">
                <Button raised to="/">{{ $t('ui.backhome') }}</Button>
            </div>
        </Card>
    </div>
</template>

<script>
import Card from '@/components/Card';
import Button from '@/components/Button';

export default {
    components: {
        Card,
        Button
    },

    data() {
        return {
            status: this.$route.params.status
        };
    }
};
</script>

<style lang="scss" scoped>
.reload-status {
    max-width: 700px;
    margin: 0 auto;
}

p {
    padding-top: 16px;
    font-size: 16px;
}
</style>
