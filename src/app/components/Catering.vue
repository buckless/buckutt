<template>
    <div class="b-catering">
        <div class="b-catering__list">
            <h3>Selectionnez l'article à décompter</h3>
            <div v-for="article in articles" @click="toggleNfc(article)">
                {{ article.name }}
            </div>
        </div>
        <nfc mode="write" @read="deduct" @cancel="closeWriter" v-if="writeCatering" key="write" :successText="successText" />
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            writeCatering: false,
            selectedArticle: null,
            lastArticle: {
                name: '',
                balance: 0
            }
        };
    },

    methods: {
        ...mapActions(['sendRequest']),

        toggleNfc(article) {
            this.selectedArticle = article;
            this.writeCatering = true;
        },

        closeWriter() {
            this.writeCatering = false;
        },

        deduct(cardId, credit, options) {
            const dayOne = new Date(config.catering.dayOne);
            const today = new Date();
            const duration = config.catering.duration;
            let dayToCheck;
            let rightDayIndex = -1;

            for (let i = 0; i < duration; i++) {
                dayToCheck = new Date(dayOne.getTime() + i * (24 * 60 * 60 * 1000));
                if (
                    dayToCheck.getDate() === today.getDate() &&
                    dayToCheck.getMonth() === today.getMonth() &&
                    dayToCheck.getFullYear() === today.getFullYear()
                ) {
                    rightDayIndex = i;
                }
            }

            if (rightDayIndex < 0) {
                this.closeWriter();
                this.$store.commit('ERROR', { message: 'Catering not available today' });
                return;
            }

            const userArticleIndex = options.catering.findIndex(
                article =>
                    article.id === this.selectedArticle.id &&
                    article.validity[rightDayIndex] &&
                    article.balance > 0
            );

            if (userArticleIndex < 0) {
                this.closeWriter();
                this.$store.commit('ERROR', { message: 'Insufficient balance for today' });
                return;
            }

            const deductedOptions = options;
            deductedOptions.catering[userArticleIndex] = options.catering[userArticleIndex];
            deductedOptions.catering[userArticleIndex].balance -= 1;

            const cateringToSend = {
                cateringId: this.selectedArticle.id,
                name: this.selectedArticle.name,
                molType: 'cardId',
                buyer: cardId
            };

            new Promise(resolve => {
                window.app.$root.$emit('readyToWrite', credit, deductedOptions);
                window.app.$root.$on('writeCompleted', () => resolve());
            })
                .then(() =>
                    this.sendRequest({
                        method: 'post',
                        url: 'services/catering',
                        data: cateringToSend
                    })
                )
                .catch(err => {
                    // We always use card data for catering: it has to work
                    console.error(err);
                    return Promise.resolve();
                })
                .then(() => {
                    this.lastArticle = {
                        name: this.selectedArticle.name,
                        balance: deductedOptions.catering[userArticleIndex].balance
                    };
                    this.selectedArticle = null;
                });
        }
    },

    computed: {
        ...mapState({
            operator: state => state.auth.seller
        }),

        articles() {
            return Object.values(config.catering.articles).sort((a, b) => a.name - b.name);
        },

        successText() {
            return `L'article ${this.lastArticle.name} a bien été décompté (solde restant: ${
                this.lastArticle.balance
            })`;
        }
    }
};
</script>

<style>
@import '../main.css';

.b-catering {
    background-color: #f3f3f3;
    width: 100vw;

    & > .b-catering__list {
        max-width: 600px;
        margin: auto;
        text-align: center;

        & > div {
            background-color: #fff;
            box-shadow: 0 0 2px color($black a(0.25)), 0 2px 3px color($black a(0.25));
            border-radius: 2px;
            cursor: pointer;
            max-width: 300px;
            min-height: 40px;
            margin: 15px auto;
            line-height: 40px;
            text-overflow: ellipsis;
        }
    }
}
</style>
