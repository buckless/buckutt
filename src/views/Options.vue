<template>
    <div class="options">
        <h2>Gérer les options d'une carte</h2>
        <p>Choisissez les options souhaitées de la carte</p>

        <button @click="writeModal = true">Valider</button>

        <div class="options">
            <label v-if="developermode">
                <input type="checkbox" v-model="assignedCard">
                Carte assignée
            </label>

            <label>
                <input type="checkbox" v-model="paidCard">
                Carte payée
            </label>

            <label v-if="developermode">
                <input type="checkbox" v-model="lockedCard">
                Carte bloquée
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
                <i @click.stop="close(article)" v-if="isActive(article) > -1">Annuler</i>
                <br/>
                <br/>
                <br/>
                Solde sur carte :
                <UnitInput
                    v-model="balances[i]"
                    :maxNumber="article.maxNumber"></UnitInput>
                <br/>
                Dépensable les jours :
                <Days v-model="validities[i]"></Days>
            </Mode>
        </div>

        <template v-if="groups.length > 0">
            <h4>Groupes</h4>
            <div class="groups">
                <div class="groups__group" v-for="group in groups">
                    <input type="checkbox" name="group" class="out-of-screen" :id="group.id" v-model="activeGroups" :value="group">
                    <label :for="group.id">
                        {{ group.name }}
                    </label>
                </div>
            </div>
        </template>

        <nfc
            mode="write"
            @read="writeOptions"
            @cancel="writeModal = false"
            successText="Options écrites"
            v-if="writeModal"
            key="validate"
            disableSignCheck
            disableLockCheck
            shouldPinUnlock />
    </div>
</template>

<script>
import Days from '@/components/Days';
import Mode from '@/components/Mode';
import Nfc from '@/components/Nfc';
import UnitInput from '@/components/UnitInput';

export default {
    components: {
        Days,
        Mode,
        Nfc,
        UnitInput
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
            lockedCard: false,
            developermode: sessionStorage.getItem('masterapp-developertools') === 'true',
            groups: [],
            activeGroups: []
        };
    },

    methods: {
        open(article) {
            this.balances[this.articles.indexOf(article)] = 0;
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

        writeOptions(cardId, credit, options) {
            const catering = JSON.parse(process.env.VUE_APP_ARTICLES).map((article, i) => ({
                id: article.id,
                balance: this.balances[i],
                validity: this.validities[i]
            }));

            const newOptions = {
                catering
            };

            if (this.developermode) {
                newOptions.assignedCard = this.assignedCard;
                newOptions.locked = this.lockedCard;
                newOptions.paidCard = this.paidCard;
            } else {
                newOptions.assignedCard = true;
                newOptions.locked = options.locked;
                newOptions.paidCard = this.paidCard;
            }

            window.app.$root.$emit('readyToWrite', credit, newOptions);

            window.app.$root.$on('writeCompleted', () => {
                setTimeout(() => {
                    if (this.activeGroups.length > 0) {
                        window.queue
                            .method('post')
                            .url('assigner')
                            .data({
                                cardId,
                                anon: true,
                                groups: this.activeGroups.map(g => g.id)
                            })
                            .push();
                    }

                    this.writeModal = false;
                    this.$forceUpdate();

                    setTimeout(() => {
                        this.writeModal = true;
                    }, 50);
                }, 400);
            });
        }
    },

    mounted() {
        if (localStorage.hasOwnProperty('masterapp-groups')) {
            this.groups = JSON.parse(localStorage.getItem('masterapp-groups'));
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

.groups {
    margin-top: 16px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.groups__group > label {
    display: block;
    width: 100%;
    padding: 10px;
    font-weight: 500;
}

.groups__group > input:checked + label {
    background-color: #2980b9;
    color: #fff;
}

.out-of-screen {
    position: absolute;
    left: -9999px;
    opacity: 0;
}
</style>
