<template>
    <div
        class="tile-card-staff mdl-card"
        :class="{ 'mdl-shadow--2dp': !active, 'mdl-shadow--8dp': active }"
        @mouseover="active = true"
        @mouseleave="active = false">
        <div>
            <div class="mdl-card__title mdl-card--expand">
                <i class="material-icons">assignment_ind</i>
                <h6 class="b--capitalized">
                    {{ user.firstname }} {{ user.lastname }}
                </h6>
            </div>
            <div class="mdl-card__supporting-text">
                Droits:
                <div v-for="(right, index) in user.rights" :key="index">
                    <span><i class="material-icons">assignment_turned_in</i> {{ right.name }}</span>
                    <span><i class="material-icons">location_on</i> {{ right.point.name }}</span>
                    <span><i class="material-icons">alarm</i> {{ right.period.name }}</span>
                </div>
            </div>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <router-link :to="`${user.id}/rights`">
                <mdl-button colored>Gérer les droits</mdl-button>
            </router-link>
            <router-link :to="user.id">
                <mdl-button colored>Gérer le participant</mdl-button>
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        user: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            active: false
        };
    }
};
</script>

<style>
.tile-card-staff.mdl-card {
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
            height: 118px;
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
