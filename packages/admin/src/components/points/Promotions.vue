<template>
    <div>
        <strong>Note:</strong> Seules les formules dont les articles sont en vente dans le guichet
        apparaissent ici.

        <b-pagination :rows="pointPromotions" v-slot="{ rows }">
            <b-table :rows="rows" @click="editPromotion" />
        </b-pagination>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import sortOrder from '@/lib/sortOrder';

export default {
    methods: {
        ...mapActions(['fetchObjects']),

        editPromotion(promotion) {
            this.$router.push(`/points/${this.focusedPoint.id}/promotions/${promotion}`);
        }
    },

    computed: {
        ...mapGetters(['focusedElements', 'getApiObjects']),

        focusedPoint() {
            return this.focusedElements[0];
        },

        promotions() {
            return this.getApiObjects('promotions');
        },

        pointPromotions() {
            const pointArticles = (this.focusedPoint.categories || []).reduce(
                (a, b) => a.concat(b.articles),
                []
            );

            const fullPromotions = this.promotions
                .filter(promotion => {
                    if (!promotion.sets) {
                        return true;
                    }

                    const toReduce = promotion.sets.map(set => {
                        let match = false;

                        (set.articles || []).forEach(article => {
                            if (pointArticles.some(a => a.id === article.id)) {
                                match = true;
                            }
                        });

                        return match;
                    });

                    return toReduce.reduce((a, b) => a && b, toReduce.length > 0);
                })
                .map(promotion => ({
                    ...promotion,
                    prices: (promotion.prices || []).filter(
                        price => price.point_id === this.focusedPoint.id
                    )
                }));

            return [].concat(
                fullPromotions
                    .filter(promotion => promotion.prices.length > 0)
                    .map(promotion => ({
                        id: promotion.id,
                        icon: 'stars',
                        title: promotion.name
                    }))
                    .sort((a, b) => sortOrder(a.title, b.title)),
                fullPromotions
                    .filter(promotion => promotion.prices.length === 0)
                    .map(promotion => ({
                        id: promotion.id,
                        icon: 'stars',
                        title: promotion.name,
                        subtitle: 'Pas de prix défini'
                    }))
                    .sort((a, b) => sortOrder(a.title, b.title))
            );
        }
    },

    mounted() {
        this.fetchObjects({ route: 'promotions' });
    }
};
</script>

<style></style>
