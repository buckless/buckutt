<template>
    <div class="options">
        <h2>Gérer les options d'une carte</h2>
        <p>Choisissez les options souhaitées de la carte</p>

        <button @click="writeModal = true">Valider</button>

        <div class="options">
            <label>
                <input type="checkbox" v-model="assignedCard">
                Rendre la carte assignée
            </label>

            <label>
                <input type="checkbox" v-model="paidCard">
                Rendre la carte payée
            </label>

            <label>
                <input type="checkbox" v-model="lockedCard">
                Rendre la carte bloquée
            </label>
        </div>

        <div class="toggles">
            <Mode
                v-for="(article, i) in articles"
                class="toggle"
                :active="isActive(article) > -1"
                :key="i"
                @click.native="open(article)">
                <strong>{{ article.name }}</strong>
                <i @click.stop="close(article)" v-if="isActive(article) > -1">Fermer</i>
                <br/>
                <br/>
                Solde sur carte :
                <vue-slider
                    ref="slider"
                    v-model="balances[i]"
                    :max="article.maxNumber"
                    :tooltip="false"
                    :piecewise="true"
                    :piecewise-label="true"
                    :clickable="false"
                    :speed="0.1"
                    tooltip-dir="bottom"></vue-slider>
                <br/>
                Dépensable les jours :
                <Days v-model="validities[i]"></Days>
            </Mode>
        </div>

        <nfc
            mode="write"
            @read="writeOptions"
            @cancel="writeModal = false"
            successText="Options écrites"
            v-if="writeModal"
            key="validate"
            disableSignCheck
            shouldPinUnlock />
    </div>
</template>

<script>
import vueSlider from 'vue-slider-component/src/vue2-slider.vue';

import Days from '@/components/Days';
import Mode from '@/components/Mode';
import Nfc from '@/components/Nfc';

export default {
    components: {
        Days,
        Mode,
        Nfc,
        vueSlider
    },

    data() {
        const articles = JSON.parse(process.env.VUE_APP_ARTICLES);
        const days = parseInt(process.env.VUE_APP_CATERING_DAYS, 10);

        return {
            writeModal: false,
            days,
            articles,
            balances: articles.map(article => 0),
            validities: articles.map(article => Array(days).fill(false)),
            selectedArticles: [],
            assignedCard: false,
            paidCard: false,
            lockedCard: false
        };
    },

    methods: {
        toggle(article) {
            const index = this.isActive(article);

            if (index > -1) {
                this.balances[this.articles.indexOf(article)] = 0;
                this.selectedArticles.splice(index, 1);
            } else {
                this.balances[this.articles.indexOf(article)] = article.maxNumber;
                setTimeout(() => this.selectedArticles.push(article));
            }
        },

        open(article) {
            this.balances[this.articles.indexOf(article)] = article.maxNumber;
            setTimeout(() => this.selectedArticles.push(article));
        },

        close(article) {
            const index = this.isActive(article);

            this.balances[this.articles.indexOf(article)] = 0;
            this.selectedArticles.splice(index, 1);
        },

        isActive(article) {
            return this.selectedArticles.findIndex(
                selectedArticle => selectedArticle.id === article.id
            );
        },

        writeOptions(_, credit, options) {
            const catering = JSON.parse(process.env.VUE_APP_ARTICLES).map((article, i) => ({
                id: article.id,
                balance: this.balances[i],
                validity: this.validities[i]
            }));

            window.app.$root.$emit('readyToWrite', credit, {
                assignedCard: this.assignedCard,
                locked: this.lockedCard,
                paidCard: this.paidCard,
                catering
            });

            window.app.$root.$on('writeCompleted', () => {
                setTimeout(() => {
                    this.writeModal = false;
                    this.$forceUpdate();

                    setTimeout(() => {
                        this.writeModal = true;
                    }, 50);
                }, 400);
            });
        }
    }
};
</script>

<style scoped>
h2 {
    text-align: center;
}

p {
    margin: 1em auto 0 auto;
    padding: 0 12px;
    text-align: justify;
    max-width: 320px;
}

button {
    margin: 6px auto;
}

.options {
    display: flex;
    flex-direction: column;
    padding: 12px 24px;
}

.toggles {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.toggle {
    width: 100%;
    height: 45px;
    margin-top: 12px;
    padding: 12px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 0 0 2px transparent;
    -webkit-tap-highlight-color: transparent;
}

.toggle i {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #e74c3c;
    color: #fff;
    padding: 2px 8px;
    border-radius: 3px;
    text-transform: none;
}

.toggle[active] {
    height: auto;
    border-color: #1abc9c;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 0 0 2px #1abc9c;
}

.vue-slider-component {
    opacity: 0;
}

.toggle[active] .vue-slider-component {
    opacity: 1;
}
</style>
