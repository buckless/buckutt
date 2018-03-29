<template>
    <div class="b-assign-status">
        <div class="mdc-card">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Inscription</h1>
            </section>
            <section class="mdc-card__supporting-text" v-if="status === 'success'">
                Votre inscription est validée. Vérifiez votre boîte mail, vous devriez avoir reçu votre code PIN. Vous pourrez le changer une fois connecté.
            </section>
            <section class="mdc-card__supporting-text" v-else>
                Échec de l'inscription. Vérifiez vos informations et réessayez, ou contactez un organisateur.
            </section>
            <section class="mdc-card__actions">
                <router-link tag="button" to="/" class="mdc-button mdc-button--raised">Retour à l'accueil</router-link>
            </section>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        status: {
            type    : String,
            required: true
        }
    }
};
</script>

<style lang="scss">
.b-assign-status section.mdc-card__supporting-text {
    padding-top: 16px;
    font-size: 16px;
}
</style>
