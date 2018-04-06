<template>
    <div class="b-history">
        <div class="b-history__text" v-if="cardNumber.length === 0">
            Approchez la carte cashless
            <div>Pour visualiser les derniers achats sur cette borne</div>
            <nfc mode="read" @read="onCard" />
        </div>
        <div v-else>
            <div class="b-history__text" v-if="entries.length === 0">
                <div>
                    Aucun entrée pour cette carte. Vous pouvez essayer sur une autre carte.
                    <br/>
                    <a href="#" @click.prevent="toggleHistory">Retour au mode vente</a>
                </div>
            </div>
            <div class="b-history__list" v-else>
                <div class="b-history__list__entry" v-for="entry in entries">
                    <div class="b-history__list__entry__top">
                        <span class="b-history__list__entry__date">
                            {{ entry.date }}
                        </span>
                        <span class="b-history__list__entry__reload" v-if="entry.reload">
                            <currency :value="entry.reload" showPlus />
                        </span>
                        <span class="b-history__list__entry__cost" v-if="entry.cost">
                            -<currency :value="entry.cost" />
                        </span>
                        <span style="flex: 1"></span>
                        <button class="b-history__list__entry__button" @click.prevent="selectedEntry = entry">
                            <i class="b-icon">delete</i>
                        </button>
                    </div>
                    <div class="b-history__list__entry__content">
                        <template v-for="item in entry.items">
                            {{ item.name }}<br />
                        </template>
                        <template v-if="entry.items.length === 0 && entry.reload > 0">Rechargement</template>
                    </div>
                </div>
            </div>
        </div>
        <nfc mode="write" successText="Transaction annulée !" @read="onCard" @cancel="selectedEntry = null" v-if="selectedEntry" />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Currency from './Currency';

export default {
    components: {
        Currency
    },

    data() {
        return {
            selectedEntry: null,
            localCardNumber: ''
        };
    },

    computed: {
        cardNumber() {
            return this.buyer.isAuth ? this.buyer.meanOfLogin : this.localCardNumber;
        },

        entries() {
            return this.history
                .filter(e => e.cardNumber === this.cardNumber)
                .sort((a, b) => b.date - a.date)
                .map(e => this.resume(e));
        },

        ...mapState({
            useCardData: state => state.auth.device.event.config.useCardData,
            buyer: state => state.auth.buyer,
            history: state => state.history.history,
            items: state => state.items
        })
    },

    methods: {
        onCard(value, credit) {
            if (this.cardNumber.length === 0) {
                this.$store.commit('SET_DATA_LOADED', false);
                return this.interfaceLoader({ type: config.buyerMeanOfLogin, mol: value }).then(
                    () => {
                        if (typeof credit === 'number') {
                            this.$store.commit('OVERRIDE_BUYER_CREDIT', credit);
                        }
                        this.$store.commit('SET_DATA_LOADED', true);
                        this.localCardNumber = value;
                    }
                );
            } else if (this.cardNumber !== value) {
                this.$store.commit('ERROR', { message: 'Different card used' });
                return;
            }

            if (!this.selectedEntry) {
                return;
            }

            let selectedCredit = credit || this.buyer.credit;

            if (!Number.isInteger(selectedCredit)) {
                selectedCredit = 0;
            }

            const newCredit = selectedCredit + this.creditDifference(this.selectedEntry);

            if (newCredit < 0 && this.useCardData) {
                this.selectedEntry = null;
                this.$store.commit('ERROR', { message: 'Not enough credit' });
                return;
            }

            this.$store.commit('SET_DATA_LOADED', false);
            this.cancelEntry(this.selectedEntry)
                .then(() => {
                    this.removeFromHistory(this.selectedEntry);

                    if (this.useCardData) {
                        return new Promise(resolve => {
                            window.app.$root.$emit('readyToWrite', newCredit);
                            window.app.$root.$on('writeCompleted', () => resolve());
                        });
                    }

                    return Promise.resolve();
                })
                .then(() => {
                    if (this.buyer.isAuth) {
                        this.$store.commit('OVERRIDE_BUYER_CREDIT', newCredit);
                    }

                    this.$store.commit('SET_DATA_LOADED', true);

                    setTimeout(() => {
                        this.selectedEntry = null;
                    }, 1500);
                });
        },

        resume(entry) {
            const items = entry.basketToSend.filter(e => e.cost).map(e => {
                const name = e.promotion_id
                    ? this.items.promotions.find(p => p.id === e.promotion_id).name
                    : this.items.items.find(i => i.id === e.articles[0].id).name;

                return {
                    name,
                    cost: e.cost
                };
            });

            const cost = items.map(e => e.cost).reduce((a, b) => a + b, 0);
            const reload = entry.basketToSend
                .filter(e => e.credit)
                .map(e => e.credit)
                .reduce((a, b) => a + b, 0);

            const p = n => (n < 10 ? `0${n}` : n.toString());

            let date = `${p(entry.date.getDate())}/${p(entry.date.getMonth() + 1)}`;
            date += '-';
            date += `${p(entry.date.getHours())}:${p(entry.date.getMinutes())}`;

            return {
                cost,
                reload,
                date,
                items,
                transactionIds: entry.transactionIds,
                localId: entry.localId
            };
        },

        creditDifference(entry) {
            return -1 * (entry.reload - entry.cost);
        },

        ...mapActions(['toggleHistory', 'cancelEntry', 'removeFromHistory', 'interfaceLoader'])
    }
};
</script>

<style>
@import '../main.css';

.b-history {
    background-color: #f3f3f3;
    width: 100vw;

    & > div {
        max-width: 600px;
        margin: auto;
    }
}

.b-history__text {
    font-size: 18px;
    font-weight: bold;
    padding: 30px 5px;
    text-align: center;
}

.b-history__text > div {
    font-size: 16px;
    font-weight: normal;
}

.b-history__text a {
    display: inline-block;
    color: $red;
    margin-top: 16px;
    text-decoration: none;
}

.b-history__list {
    margin: 15px;
    background-color: #fff;
    border-radius: 3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.b-history__list__entry {
    padding: 20px 15px;

    &:not(:last-child) {
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
}

.b-history__list__entry__top {
    display: flex;
}

.b-history__list__entry__date {
    font-weight: bold;
}

.b-history__list__entry__reload,
.b-history__list__entry__cost,
.b-history__list__entry__content {
    margin-left: 5px;
}

.b-history__list__entry__reload {
    font-weight: bold;
    color: $green;
}

.b-history__list__entry__cost {
    font-weight: bold;
    color: $orange;
}

.b-history__list__entry__content {
    font-size: 13px;
    margin-top: -13px;
}

.b-history__list__entry__button {
    background: $red;
    color: #fff;
    cursor: pointer;
    padding: 5px 10px;
    border: 0;
    border-radius: 3px;
}
</style>
