<template>
    <div
        class="tile-card-wiket mdl-card"
        :class="{ 'mdl-shadow--2dp': !active, 'mdl-shadow--8dp': active }"
        @mouseover="active = true"
        @mouseleave="active = false"
    >
        <div>
            <div class="mdl-card__title mdl-card--expand">
                <i class="material-icons">view_comfy</i>
                <h6 class="b--capitalized">
                    {{ point.name }}
                </h6>
            </div>
            <div class="mdl-card__supporting-text">
                <template v-if="point.wikets.length > 0">
                    Équipements:
                    <div v-for="(wiket, index) in point.wikets" :key="index">
                        <span> <i class="material-icons">devices</i> {{ wiket.device.name }} </span>
                        <span v-if="event.usePeriods">
                            <i class="material-icons">alarm</i> {{ wiket.period.name }}
                        </span>
                        <template v-else-if="wiket.period.id !== event.defaultPeriod_id">
                            <mdl-tooltip
                                :target="`point_${point.id}_${index}`"
                                class="b--uncapitalize"
                            >
                                Une période autre que<br />celle par défaut est utilisée.
                            </mdl-tooltip>
                            <i :id="`point_${point.id}_${index}`" class="material-icons">warning</i>
                        </template>
                    </div>
                </template>
                <template v-else
                    >Aucun équipement n'est encore assigné à ce guichet.</template
                >
            </div>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <router-link :to="`/points/${point.id}`">
                <mdl-button colored>Gérer le guichet</mdl-button>
            </router-link>
            <router-link :to="`/wikets/${point.id}`">
                <mdl-button colored>Modifier les articles</mdl-button>
            </router-link>
            <b-confirm class="b--inline" @confirm="removeObject({ route: 'points', value: point })">
                <mdl-button icon="remove_circle_outline" class="b--error"></mdl-button>
            </b-confirm>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    props: {
        point: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            active: false
        };
    },

    computed: {
        ...mapGetters(['event'])
    },

    methods: {
        ...mapActions(['removeObject'])
    }
};
</script>

<style>
.tile-card-wiket.mdl-card {
    width: 700px;
    margin: 10px;
    max-height: 300px;

    & > div:first-child {
        display: flex;
        flex-direction: row;
        align-items: center;

        & > .mdl-card__title {
            align-items: center;
            flex-direction: column;
            width: 250px;
            text-align: center;
            margin-top: 15px;
            color: #222;

            & > i {
                font-size: 100px;
                margin-left: -5px;
            }

            & > h6 {
                margin-top: 0;
            }
        }

        & > .mdl-card__supporting-text {
            overflow-y: overlay;
            height: 120px;
            margin-right: 5px;
            padding: 0;

            & > div {
                display: flex;

                & > span {
                    display: flex;
                    align-items: center;
                    width: 50%;
                    flex: auto;

                    & > i {
                        margin-right: 5px;
                        font-size: 25px;
                    }
                }
            }
        }
    }

    & > .mdl-card__actions {
        text-align: right;
    }
}
</style>
