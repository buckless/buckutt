<template>
    <div class="b-pricesEditor" v-if="item">
        <div class="b-prices">
            <span v-if="displayedPrices.length === 0"
                >Aucun prix n'est encore défini pour cet item.</span
            >
            <div v-for="(price, index) in displayedPrices" :key="index" class="b-price">
                <span class="b-price-entry">
                    <b-icon name="attach_money" /> {{ price.amount | price(true) }}
                    <i class="material-icons b-free" v-if="price.freePrice">create</i>
                </span>
                <span v-if="event.usePeriods" class="b-price-entry">
                    <b-icon name="alarm" /> {{ price.period.name }}
                </span>
                <span v-if="event.useFundations" class="b-price-entry">
                    <b-icon name="local_atm" /> {{ price.fundation.name }}
                </span>
                <span v-if="event.useGroups" class="b-price-entry">
                    <b-icon name="group" /> {{ price.group.name }}
                </span>
                <b-confirm
                    @confirm="removePrice(price)"
                    class="b-price-delete"
                >
                    <b-button><b-icon name="delete"/></b-button>
                </b-confirm>
                <b-icon
                    v-if="generateWarning(price)"
                    :title="generateWarning(price)"
                    name="warning"
                />
            </div>
        </div>
        <form @submit.prevent="createPrice(newPrice)" class="b-prices-form">
            <div class="b-prices-form-amount b-prices-form-entry">
                <b-input placeholder="Montant (centimes)" v-model="newPrice.amount" small />
                <!--                 <mdl-icon-toggle
                    v-if="isArticle"
                    v-model="newPrice.freePrice"
                    icon="create"
                    id="fp"
                ></mdl-icon-toggle> -->
            </div>
            <b-autocomplete
                placeholder="Période"
                v-model="newPrice.period"
                :suggestions="[{ name: 'groups', data: currentPeriodsOptions }]"
                small
                v-if="event.usePeriods"
                class="b-prices-form-entry"
            />
            <b-autocomplete
                placeholder="Fondation"
                v-model="newPrice.fundation"
                :suggestions="[{ name: 'fundations', data: fundationsOptions }]"
                small
                v-if="event.useFundations"
                class="b-prices-form-entry"
            />
            <b-autocomplete
                placeholder="Groupe"
                v-model="newPrice.group"
                :suggestions="[{ name: 'groups', data: groupsOptions }]"
                small
                v-if="event.useGroups"
                class="b-prices-form-entry"
            />
            <b-button :disabled="disabledAdd" class="b-prices-form-add"
                ><b-icon name="add"
            /></b-button>
        </form>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import '@/lib/price';

const pricePattern = {
    amount: '',
    period: null,
    group: null,
    fundation: null,
    point: null,
    freePrice: false
};

export default {
    props: {
        item: Object,
        point: Object,
        isArticle: Boolean
    },

    data() {
        return {
            newPrice: Object.assign({}, pricePattern),
            image: null
        };
    },

    computed: {
        ...mapGetters(['groupsOptions', 'currentPeriodsOptions', 'fundationsOptions', 'event']),

        displayedPrices() {
            return (this.item.prices || []).filter(price => price.point_id === this.point.id);
        },

        disabledAdd() {
            return (
                (!this.newPrice.fundation && this.event.useFundations) ||
                (!this.newPrice.period && this.event.usePeriods) ||
                (!this.newPrice.group && this.event.useGroups)
            );
        }
    },

    methods: {
        ...mapActions(['removeObject', 'createObject', 'notify']),

        generateWarning(price) {
            let warning;

            if (
                price.fundation_id !== this.event.defaultFundation_id &&
                !this.event.useFundations
            ) {
                warning = 'Une fondation autre que celle par défaut est utilisée.';
            }

            if (price.group_id !== this.event.defaultGroup_id && !this.event.useGroups) {
                warning = 'Un groupe autre que celui par défaut est utilisé.';
            }

            if (price.period_id !== this.event.defaultPeriod_id && !this.event.usePeriods) {
                warning = 'Une période autre que celle par défaut est utilisée.';
            }

            return warning;
        },

        async createPrice(price) {
            const priceToCreate = {
                amount: price.amount,
                freePrice: price.freePrice,
                point_id: this.point.id,
                fundation_id: this.event.useFundations
                    ? price.fundation
                    : this.event.defaultFundation_id,
                group_id: this.event.useGroups ? price.group : this.event.defaultGroup_id,
                period_id: this.event.usePeriods ? price.period : this.event.defaultPeriod_id
            };

            if (this.isArticle) {
                priceToCreate.article_id = this.item.id;
            } else {
                priceToCreate.promotion_id = this.item.id;
            }

            try {
                await this.createObject({
                    route: 'prices',
                    value: priceToCreate
                });

                this.notify("Le prix a bien été ajouté à l'article");

                this.newPrice = Object.assign({}, pricePattern);
            } catch {
                this.notify("Il y a eu une erreur lors de l'ajout du prix");
            }
        },

        async removePrice(price) {
            try {
                await this.removeObject({ route: 'prices', value: price });
                this.notify("Le prix a bien été supprimé de l'article");
            } catch {
                this.notify("Il y a eu une erreur lors de la suppression du prix")
            }
        }
    }
};
</script>

<style scoped>
.b-pricesEditor {
    & > .b-prices {
        margin-top: 10px;
        max-height: 156px;
        overflow: auto;

        & > h4 {
            margin: 0px;
            margin-bottom: 5px;
        }

        & > .b-price {
            display: flex;
            align-items: center;
            height: 38px;

            & > .b-price-entry {
                display: flex;
                align-items: center;
                width: 170px;
                margin-right: 10px;

                & > span {
                    margin-right: 5px;
                    font-size: 25px;
                }

                & > .b-free {
                    font-size: 16px;
                    margin-left: 5px;
                }
            }
        }
    }

    & > .b-prices-form {
        display: flex;
        align-items: center;
        margin-top: 15px;

        & > .b-prices-form-amount {
            display: flex;
            align-items: center;
        }

        & > .b-prices-form-entry {
            margin-right: 10px;
            width: 170px;
        }
    }
}
</style>
