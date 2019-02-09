<template>
    <div class="b-pricesEditor" v-if="item">
        <div class="b-pricesEditor__item b-item">
            <div class="b-item__image">
                <img :src="image" draggable="false" height="100%" width="100%" v-if="isArticle" />
                <i class="material-icons b-item__promotion" v-else>stars</i>
            </div>
            <div class="b-item__text" ref="name">{{ item.name }}</div>
        </div>
        <div class="b-pricesEditor__prices">
            <h4>Tarifs</h4>
            <span v-if="displayedPrices.length === 0"
                >Aucun prix n'est encore défini pour cet article.</span
            >
            <div v-for="(price, index) in displayedPrices" :key="index">
                <span>
                    <i class="material-icons">attach_money</i> {{ price.amount | price(true) }} TTC
                </span>
                <span v-if="event.usePeriods">
                    <i class="material-icons">alarm</i> {{ price.period.name }}
                </span>
                <span v-if="event.useFundations">
                    <i class="material-icons">local_atm</i> {{ price.fundation.name }}
                </span>
                <span v-if="event.useGroups">
                    <i class="material-icons">group</i> {{ price.group.name }}
                </span>
                <b-confirm @confirm="removeObject({ route: 'prices', value: price })">
                    <mdl-button icon="delete"></mdl-button>
                </b-confirm>
                <template v-if="generateWarning(price)">
                    <mdl-tooltip
                        :target="price.id"
                        class="b--uncapitalize"
                        v-html="generateWarning(price)"
                    ></mdl-tooltip>
                    <i :id="price.id" class="material-icons">warning</i>
                </template>
            </div>
            <form @submit.prevent="createPrice(newPrice)">
                <mdl-textfield
                    floating-label="Montant TTC (centimes)"
                    v-model="newPrice.amount"
                    required="required"
                    pattern="[0-9]+"
                    error="Le montant doit être un entier"
                ></mdl-textfield>
                <b-inputselect
                    label="Période"
                    id="period-select"
                    :options="currentPeriodOptions"
                    :fullOptions="periodOptions"
                    v-model="newPrice.period"
                    v-if="event.usePeriods"
                ></b-inputselect>
                <b-inputselect
                    label="Fondation"
                    id="fundation-select"
                    :options="fundationOptions"
                    v-model="newPrice.fundation"
                    v-if="event.useFundations"
                ></b-inputselect>
                <b-inputselect
                    label="Groupe"
                    id="group-select"
                    :options="groupOptions"
                    v-model="newPrice.group"
                    v-if="event.useGroups"
                ></b-inputselect>
                <mdl-button :disabled="disabledAdd" icon="add" colored></mdl-button>
            </form>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { getImage } from '../../../lib/fetchImages';
import textSize from '../../../lib/textSize';
import ClientItem from './ClientViewer-Item';
import '../../../lib/price';

const pricePattern = {
    amount: 0,
    period: null,
    group: null,
    fundation: null,
    point: null
};

export default {
    props: {
        item: Object,
        point: Object,
        isArticle: Boolean
    },

    components: {
        'b-clientitem': ClientItem
    },

    data() {
        return {
            newPrice: Object.assign({}, pricePattern),
            image: null
        };
    },

    computed: {
        ...mapGetters([
            'groupOptions',
            'periodOptions',
            'currentPeriodOptions',
            'fundationOptions',
            'event'
        ]),

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
        ...mapActions(['removeObject', 'createObject', 'notify', 'notifyError']),

        updateItem() {
            const initialFontSize = 16;

            const $name = this.$refs.name;

            if (!$name || !this.item) {
                return;
            }

            const size = textSize(this.item.name);
            const maxSize = 130;

            $name.style.fontSize = `${initialFontSize}px`;

            if (size > maxSize) {
                $name.style.fontSize = `${initialFontSize * (maxSize / size)}px`;
            }

            if (this.isArticle) {
                getImage(this.item.id)
                    .then(image => {
                        this.image = image.image;
                    })
                    .catch(() => {
                        this.image = null;
                    });
            }
        },

        generateWarning(price) {
            let warning;

            if (
                price.fundation_id !== this.event.defaultFundation_id &&
                !this.event.useFundations
            ) {
                warning = 'Une fondation autre que<br />celle par défaut est utilisée.';
            }

            if (price.group_id !== this.event.defaultGroup_id && !this.event.useGroups) {
                warning = 'Un groupe autre que<br />celui par défaut est utilisé.';
            }

            if (price.period_id !== this.event.defaultPeriod_id && !this.event.usePeriods) {
                warning = 'Une période autre que<br />celle par défaut est utilisée.';
            }

            return warning;
        },

        createPrice(price) {
            const priceToCreate = {
                amount: price.amount,
                point_id: this.point.id,
                fundation_id: this.event.useFundations
                    ? price.fundation.id
                    : this.event.defaultFundation_id,
                group_id: this.event.useGroups ? price.group.id : this.event.defaultGroup_id,
                period_id: this.event.usePeriods ? price.period.id : this.event.defaultPeriod_id
            };

            if (this.isArticle) {
                priceToCreate.article_id = this.item.id;
            } else {
                priceToCreate.promotion_id = this.item.id;
            }

            this.createObject({
                route: 'prices',
                value: priceToCreate
            })
                .then(() => {
                    this.newPrice = Object.assign({}, pricePattern);
                    this.notify({ message: "Le prix a bien été ajouté à l'article" });
                })
                .catch(err =>
                    this.notifyError({
                        message: "Le prix n'a pas pu être ajouté à l'article",
                        full: err
                    })
                );
        }
    },

    mounted() {
        this.updateItem();
    },

    updated() {
        this.updateItem();
    }
};
</script>

<style>
.b-pricesEditor {
    display: flex;

    & > .b-pricesEditor__item {
        margin-right: 20px;

        & > .b-item__image {
            & > i {
                font-size: 150px;
                cursor: default;
                color: #5b5b5b;
            }
        }
    }

    & > .b-pricesEditor__prices {
        margin-top: 10px;

        & > h4 {
            margin: 0px;
            margin-bottom: 5px;
        }

        & > div {
            display: flex;
            align-items: center;

            & > i {
                margin-left: 5px;
            }

            & > span {
                display: flex;
                align-items: center;
                width: 180px;
                margin-right: 10px;

                & > i {
                    margin-right: 5px;
                    font-size: 25px;
                }
            }
        }

        & > form {
            display: flex;
            align-items: center;
            margin-top: 15px;

            & > .mdl-textfield {
                width: 180px;
                margin-right: 10px;
            }
        }
    }
}
</style>
