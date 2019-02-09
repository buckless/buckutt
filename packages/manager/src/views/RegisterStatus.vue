<template>
    <div class="reload-status">
        <Card>
            <h3 class="title">Inscription</h3>
            <p v-if="status === 'success'">
                Votre inscription est validée. Vérifiez votre boîte mail, vous devriez avoir reçu
                votre code PIN. Vous pourrez le changer une fois connecté.
            </p>
            <p v-else>
                Échec de l'inscription. Vérifiez vos informations et réessayez, ou contactez un
                organisateur.
            </p>
            <div class="actions">
                <Button raised to="/">Retour à l'accueil</Button>
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
