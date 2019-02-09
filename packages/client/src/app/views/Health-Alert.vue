<template>
    <div class="b-health-alert">
        <div class="b-health-alert-content">
            <p class="slider-value">
                {{ people }} personne<template v-if="people > 1"
                    >s</template
                >
                nécessitant de l'aide
            </p>
            <InputSlider v-model="people" />
            <ToggleButton v-model="notAlcohol" off="Malaise/Alcool" on="Autre" />
            <ToggleButton v-model="blood" off="Pas de sang" on="Saignement" />
            <ToggleButton v-model="closedEyes" off="Yeux ouverts" on="Yeux fermés" />
            <button
                :disabled="done"
                @click.prevent="send({ people, notAlcohol, blood, closedEyes, active: true })"
            >
                <i class="b-icon">favorite</i>
                <template v-if="done"
                    >Alerte envoyée</template
                >
                <template v-else
                    >Envoyer</template
                >
            </button>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import InputSlider from '@/components/InputSlider';
import ToggleButton from '@/components/ToggleButton';

export default {
    components: {
        InputSlider,
        ToggleButton
    },

    data: () => ({
        people: 1,
        notAlcohol: false,
        blood: false,
        closedEyes: false,
        done: false
    }),

    methods: {
        send() {
            this.sendHealthAlert().then(() => {
                this.done = true;

                setTimeout(() => {
                    this.done = false;
                    this.$router.push('/items');
                }, 3000);
            });
        },

        ...mapActions(['sendHealthAlert'])
    }
};
</script>

<style scoped>
@import '../main.css';

.b-health-alert {
    padding: 20px;
}

.b-health-alert-content {
    max-width: 500px;
    margin: 0 auto;
}

.slider-value {
    text-align: center;
    margin: 0;
}

button {
    width: 200px;
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px auto 0 auto;
    font-size: 20px;
    background: #fff;
    cursor: pointer;
    color: $blue;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.24);
    border-radius: 32.5px;

    &:focus {
        outline: 0;
    }

    &:disabled {
        background-color: #f1f1f1;
        width: 240px;
    }

    & .b-icon {
        font-size: 32px;
        margin-right: 10px;
    }
}
</style>
