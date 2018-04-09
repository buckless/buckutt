<template>
    <div class="b-wiketpanel">
        <div class="b-wiketpanel__add">
            <i class="material-icons">note_add</i>
            <h6>Ajouter un guichet</h6>
        </div>
        <div class="b-wiketpanel__addwiket">
            <form @submit.prevent="redirect(chosenPoint)" v-if="remainingPoints.length > 0">
                <b-inputselect label="Guichet" id="point-select" :options="remainingPoints" v-model="chosenPoint"></b-inputselect>
                <mdl-button raised colored>Ajouter</mdl-button>
            </form>
            <p v-else>Il n'y a aucun guichet à ajouter.</p>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            chosenPoint: null
        };
    },

    methods: {
        redirect(point) {
            if (point) {
                this.$router.push(`/wikets/${point.id}/assign`);
            }
        }
    },

    computed: {
        ...mapGetters(['pointOptions']),

        pointsWikets() {
            return this.$parent.pointsWikets;
        },

        remainingPoints() {
            return this.pointOptions.filter(
                pointOption =>
                    pointOption.name !== 'Internet' &&
                    !(this.pointsWikets || []).some(point => point.id === pointOption.value.id)
            );
        }
    }
};
</script>

<style>
.b-wiketpanel {
    display: flex;
    flex-wrap: wrap;
    padding-top: 20px;
    justify-content: space-between;

    & > .b-wiketpanel__add {
        width: 180px;
        text-align: center;
        margin-right: 20px;
        color: #222;

        & > i {
            font-size: 50px;
        }

        & > h6 {
            margin-top: 0;
            font-size: 14px;
        }
    }

    & > .b-wiketpanel__addwiket {
        display: flex;
        align-items: center;
        flex: 1;

        & > form {
            & > button {
                margin-left: 10px;
                margin-top: -10px;
            }
        }
    }
}
</style>
