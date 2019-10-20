<template>
    <div class="b-history">
        <div class="b-history__text" v-if="!buyerLogged">
            Approchez la carte cashless
            <div>Pour visualiser les derniers achats sur cette borne</div>
            <nfc mode="read" @read="onCard" />
        </div>
        <div v-else>
            <div class="b-history__text" v-if="entries.length === 0">
                <div>
                    Aucun entrée pour cette carte. Vous pouvez essayer sur une autre carte.
                    <br />
                    <a href="#" @click.prevent="closeHistory">Retour au mode vente</a>
                </div>
            </div>
            <div class="b-history__list" v-else>
                <div class="b-history__list__entry" v-for="entry in entries" :key="entry.id">
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
                        <button
                            class="b-history__list__entry__button"
                            @click.prevent="selectedEntry = entry"
                        >
                            <i class="b-icon">delete</i>
                        </button>
                    </div>
                    <div class="b-history__list__entry__content">
                        <template v-for="item in entry.items">
                            <p :key="item.id">{{ item.name }}<br /></p>
                        </template>
                        <template v-if="entry.items.length === 0 && entry.reload > 0"
                            >Rechargement</template
                        >
                        <template v-if="entry.items.length === 0 && entry.refund > 0"
                            >Remboursement</template
                        >
                    </div>
                </div>
            </div>
        </div>
        <nfc
            mode="write"
            successText="Transaction annulée !"
            @read="onCard"
            @cancel="selectedEntry = null"
            v-if="selectedEntry"
        />
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import { groupBy } from 'lodash/collection';
import shortDate from '@/utils/shortDate';
import Currency from '@/components/Currency';

export default {
    components: {
        Currency
    },

    data() {
        return {
            selectedEntry: null,
            history: []
        };
    },

    computed: {
        entries() {
            return this.history
                .sort((a, b) => b.date - a.date)
                .map(e => this.resume(e));
        },

        ...mapState({
            useCardData: state => state.auth.device.event.config.useCardData,
            loggedBuyer: state => state.auth.buyer
        }),

        ...mapGetters(['buyerLogged'])
    },

    methods: {
        onCard(value, credit, options, version) {
            if (!this.buyerLogged) {
                this.$store.commit('SET_DATA_LOADED', false);
                return this.buyerLogin({ cardNumber: value, credit, options, version })
                    .then(() => this.loadHistory())
                    .then(() => {
                        this.$store.commit('SET_DATA_LOADED', true);
                    })
                    .catch(() => this.$store.commit('SET_DATA_LOADED', true));
            } else if (this.loggedBuyer.wallet !== value) {
                this.$store.commit('ERROR', { message: 'Different card used' });
                return;
            }

            if (!this.selectedEntry) {
                return;
            }

            let selectedCredit = credit || this.loggedBuyer.credit;

            if (!Number.isInteger(selectedCredit)) {
                selectedCredit = 0;
            }

            const newCredit = selectedCredit + this.creditDifference(this.selectedEntry);

            if (newCredit < 0 && this.useCardData) {
                this.selectedEntry = null;
                this.$store.commit('ERROR', { message: 'Not enough credit' });
                return;
            }

            let initialPromise = Promise.resolve();

            const newOptions = this.generateOptions(options, this.selectedEntry);

            if (this.useCardData) {
                initialPromise = new Promise(resolve => {
                    window.app.$root.$emit('readyToWrite', newCredit, newOptions);
                    window.app.$root.$on('writeCompleted', () => resolve());
                    window.app.$root.$on('rewriteCancelled', () => this.cancelEntry({
                        ...this.selectedEntry,
                        failed: true
                    }));
                });
            }

            this.$store.commit('SET_DATA_LOADED', false);
            initialPromise
                .then(() => this.cancelEntry(this.selectedEntry))
                .then(() => this.removeFromHistory(this.selectedEntry))
                .then(() => this.loadHistory())
                .then(() => {
                    this.$store.commit('OVERRIDE_BUYER_CREDIT', newCredit);
                    this.$store.commit('OVERRIDE_BUYER_CATERING', newOptions.catering || [])
                    this.$store.commit('SET_DATA_LOADED', true);

                    setTimeout(() => {
                        this.selectedEntry = null;
                    }, 1500);
                })
                .catch(err => {
                    this.$store.commit('ERROR', err.response.data);
                    this.$store.commit('SET_DATA_LOADED', true);
                });
        },

        resume(entry) {
            const basketToSend = entry.basketToSend.filter(e => !e.uncancellable);
            const items = basketToSend.filter(e => e.itemType === 'purchase' || e.itemType === 'catering');
            const refund = basketToSend
                .filter(e => e.itemType === 'refund')
                .reduce((a, b) => a + b.amount, 0);
            const cost = items.reduce((a, b) => a + b.amount, 0) + refund;
            const reload = basketToSend
                .filter(e => e.itemType === 'reload')
                .reduce((a, b) => a + b.amount, 0);

            return {
                cost,
                reload,
                refund,
                date: shortDate(entry.date),
                items,
                basketToSend,
                localId: entry.localId,
                cardNumber: entry.cardId
            };
        },

        creditDifference(entry) {
            return -1 * (entry.reload - entry.cost);
        },

        closeHistory() {
            this.$router.push('items');
        },

        async loadHistory() {
            this.history = await window.database.getHistory(this.loggedBuyer.wallet);
        },

        generateOptions(options, entry) {
            const catering = entry.basketToSend.filter(e => e.itemType === 'catering');
            const caterings = groupBy(catering, 'coupon_id');

            return {
                ...options,
                catering: options.catering.map(cat => ({
                    id: cat.id,
                    balance: caterings[cat.id] ? cat.balance + caterings[cat.id].length : cat.balance
                }))
            };
        },

        ...mapActions(['cancelEntry', 'removeFromHistory', 'buyerLogin'])
    },

    mounted() {
        if (this.buyerLogged) {
            this.loadHistory();
        }
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
