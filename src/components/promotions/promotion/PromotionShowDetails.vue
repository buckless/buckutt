<template>
    <div>
        <h5>Détails de la formule</h5>
        <b-list :elements="elements"></b-list>

        <template v-if="displayedPromotion.length > 0">
            <h5>Contenu de la formule</h5>
            <div class="b-responsive-table--nofullwidth">
                <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
                    <tbody>
                        <tr v-for="(step, index) in displayedPromotion" :key="index">
                            <td class="mdl-data-table__cell--non-numeric b-table__little">
                                1 article parmi :
                                <span class="mdl-chip b-chip--margin b-table-inter"
                                    v-if="displayedPromotion.length > (index + 1)">
                                    <span class="mdl-chip__text">
                                        +
                                    </span>
                                </span>
                            </td>
                            <td class="mdl-data-table__cell--non-numeric">
                                <template v-for="(article, articleIndex) in step.articles">
                                    <span class="mdl-chip b-chip--margin" :key="articleIndex">
                                        <span class="mdl-chip__text">
                                            {{ article.name }}
                                        </span>
                                    </span>
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { promotionDisplayer } from './promotionDisplayer';

export default {
    computed: {
        ...mapState({
            focusedPromotion: state => state.app.focusedElements[0]
        }),

        elements() {
            return [
                {
                    icon: 'keyboard_arrow_right',
                    title: 'Nom',
                    content: this.focusedPromotion.name
                }
            ];
        },

        displayedPromotion() {
            return promotionDisplayer(this.focusedPromotion);
        }
    }
};
</script>

<style>
.b-chip--margin {
    margin-left: 5px;
    margin-right: 5px;
}

.b-table__little {
    max-width: 140px;
}

.b-table-inter {
    position: relative;
    top: 30px;
    left: -72px;
}
</style>
