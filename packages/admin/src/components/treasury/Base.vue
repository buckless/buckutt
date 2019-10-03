<template>
    <div class="b-treasury">
        <div class="b-timebar">
            <div class="b-timebar-dates">
                <b-datetimeinput
                    label="Début"
                    v-model="filters.dateIn"
                    @input="computeTreasury"
                ></b-datetimeinput>
                <b-icon name="arrow_right_alt" :size="34" class="b-timebar-dates-arrow"></b-icon>
                <b-datetimeinput
                    label="Fin"
                    v-model="filters.dateOut"
                    @input="computeTreasury"
                ></b-datetimeinput>
                <b-autocomplete
                    label="Point"
                    :suggestions="pointsOptions"
                    v-model="filters.point"
                    @input="computeTreasury"
                ></b-autocomplete>
                <b-autocomplete
                    label="Fondation"
                    :suggestions="fundationsOptions"
                    v-model="filters.fundation"
                    @input="computeTreasury"
                    v-if="event.useFundations"
                ></b-autocomplete>
            </div>
        </div>
        <div class="b-treasury-content">
            <div class="b-treasury-menu">
                <b-listitem
                    icon="attach_money"
                    title="Rechargements"
                    to="/treasury/reloads"
                    :active="isActive('reloads')"
                ></b-listitem>
                <b-listitem
                    icon="money_off"
                    title="Remboursements"
                    to="/treasury/refunds"
                    :active="isActive('refunds')"
                ></b-listitem>
                <b-listitem
                    icon="shopping_cart"
                    title="Ventes"
                    to="/treasury/purchases"
                    :active="isActive('purchases')"
                ></b-listitem>
                <b-listitem
                    icon="kitchen"
                    title="Catering"
                    to="/treasury/withdrawals"
                    :active="isActive('withdrawals')"
                ></b-listitem>
            </div>
            <router-view :fields="filters" class="b-base-right"></router-view>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
    data: () => ({
        filters: {
            dateIn: null,
            dateOut: null,
            point: null,
            fundation: null
        }
    }),

    computed: {
        ...mapState({
            fullPath: state => state.route.fullPath
        }),

        ...mapGetters(['pointsOptions', 'fundationsOptions', 'event'])
    },

    methods: {
        ...mapActions(['getTreasury']),

        computeTreasury() {
            this.getTreasury(this.filters);
        },

        isActive(path) {
            return this.fullPath === `/treasury/${path}`;
        }
    },

    mounted() {
        this.computeTreasury();
    }
};
</script>

<style scoped>
.b-treasury {
    display: flex;
    flex-direction: column;

    & > .b-treasury-content {
        display: flex;
        height: 100%;

        & > .b-treasury-menu {
            width: 340px;
            height: 100%;
            background-color: #e9e9e9;
            overflow-y: auto;
        }
    }
}
</style>
