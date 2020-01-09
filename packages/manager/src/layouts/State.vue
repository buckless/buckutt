<template>
    <div class="state">
        <Card class="card">
            <h4 class="card-title">{{ title }}</h4>

            <div class="content">
                <slot />
            </div>

            <Button raised @click="toHome" class="button">{{ $t('common.next') }}</Button>
        </Card>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import Card from 'ui/src/components/Card/Card';
import Button from 'ui/src/components/Button/Button';

export default {
    components: {
        Card,
        Button
    },

    props: {
        title: String
    },

    methods: {
        ...mapActions({
            callback: 'reload/callback'
        }),

        toHome() {
            this.$router.push('/dashboard');
        }
    },

    mounted() {
        const token = this.$route.query.token || this.$route.query.paylinetoken;
        if (token) {
            this.callback({ token });
        }
    }
};
</script>

<style scoped>
.state {
    flex: 1;
    max-width: 800px;
    margin: 60px auto 0 auto;
}

.card {
    text-align: center;
}

.card-title {
    margin: 0 0 32px 0;

    font-size: 18px;
    font-weight: 600;
}

.button {
    margin-top: 20px;
}
</style>
