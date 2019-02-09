<template>
    <div class="b-wikets b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar title="Guichets" :inCard="true"></b-navbar>
            <router-link to="/wikets/add" v-if="!addWiket">
                <mdl-button class="mdl-js-ripple-effect" fab accent>
                    <i class="material-icons">add</i>
                </mdl-button>
            </router-link>
            <router-link to="/wikets" v-else>
                <mdl-button class="mdl-js-ripple-effect" fab accent>
                    <i class="material-icons">close</i>
                </mdl-button>
            </router-link>
            <div class="b-wikets__panel" v-if="addWiket">
                <router-view></router-view>
            </div>
            <div class="b-wikets__container" v-if="pointsWikets.length > 0">
                <b-wiket :point="point" v-for="point in pointsWikets" :key="point.id"></b-wiket>
            </div>
            <span v-else>Aucun point de vente n'est actif pour cet événement.</span>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import WiketTile from './WiketTile.vue';
import sortOrder from '../../lib/sortOrder';

export default {
    components: {
        'b-wiket': WiketTile
    },

    methods: {
        ...mapActions(['fetchObjectsAndRelations'])
    },

    computed: {
        ...mapState({
            fullPath: state => state.route.fullPath,
            points: state => state.objects.points
        }),

        pointsWikets() {
            const now = new Date();
            const pointsWiketsList = [];

            this.points.forEach(point => {
                if (point.wikets && point.name !== 'Internet') {
                    const lightWikets = point.wikets
                        .filter(wiket => new Date(wiket.period.end) >= now && wiket.device.id)
                        .map(wiket => ({
                            device: wiket.device,
                            period: wiket.period,
                            id: wiket.id
                        }));

                    pointsWiketsList.push({
                        ...point,
                        wikets: lightWikets
                    });
                }
            });

            return [].concat(
                pointsWiketsList
                    .filter(point => point.wikets.length > 0)
                    .sort((a, b) => sortOrder(a.name, b.name)),
                pointsWiketsList
                    .filter(point => point.wikets.length === 0)
                    .sort((a, b) => sortOrder(a.name, b.name))
            );
        },

        addWiket() {
            return this.fullPath === '/wikets/add';
        }
    },

    mounted() {
        this.fetchObjectsAndRelations({ route: 'points' });
    }
};
</script>

<style>
@import '../../variables.css';

.b-wikets {
    & > div {
        & > .b-wikets__panel {
            border-bottom: 1px solid #e0e0e0;
            margin: 0px -20px 10px -20px;
            padding: 0px 20px 10px 20px;
        }

        & > .b-wikets__container {
            display: flex;
            flex-wrap: wrap;
        }

        & > span {
            margin-top: 15px;
        }

        & > a {
            width: 56px;
            position: absolute;
            right: 20px;
            top: 35px;
        }
    }
}
</style>
