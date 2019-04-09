<template>
    <div class="reloadStatus">
        <Card>
            <h2 class="title">{{ $t('dashboard.reload.status.title') }}</h2>
            <p v-if="status === 'success'" v-html="$t('dashboard.reload.status.success')"></p>
            <p
                v-else-if="status === 'waiting' || status === 'return'"
                v-html="$t('dashboard.reload.status.waiting')"
            ></p>
            <p v-else v-html="$t('dashboard.reload.status.fail')"></p>
            <div class="actions">
                <Button raised to="/">{{ $t('ui.backhome') }}</Button>
            </div>
        </Card>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default {
    name: 'DashboardReloadStatus',

    components: {
        Card,
        Button
    },

    methods: {
        ...mapActions({
            callback: 'reload/callback'
        })
    },

    data() {
        return {
            status: this.$route.params.status,
            token: this.$route.query.token,
            paylinetoken: this.$route.query.paylinetoken
        };
    },

    mounted() {
        const token = this.token || this.paylinetoken;
        if (token) {
            this.callback({ token });
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.reloadStatus {
    padding: 1rem 0;
}

.title {
    font-weight: 500;
    margin-top: 0;
}
</style>
