<template>
    <div class="refundStatus">
        <Card>
            <h2 class="title">Enregistrement de carte</h2>
            <p v-if="status === 'success'">
                La carte a bien été enregistrée. Vous pouvez maintenant demander votre remboursement.
            </p>
            <p v-else>
                La carte n'a pas pu être enregistrée. Veuillez contacter votre banque pour plus d'informations.
            </p>
            <div class="actions">
                <Button raised to="/dashboard/refund">Retour aux remboursements</Button>
            </div>
        </Card>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default {
    name: 'DashboardRefundStatus',

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
            token: this.$route.query.token
        };
    },

    mounted() {
        if (this.token) {
            this.callback({ token: this.token });
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.refundStatus {
    padding: 1rem 0;
}

.title {
    font-weight: 500;
    margin-top: 0;
}
</style>
