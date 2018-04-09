<template>
    <div class="tile-card-event mdl-card" :class="{ 'mdl-shadow--2dp': !active, 'mdl-shadow--8dp': active }">
        <div class="mdl-card__title mdl-card--expand" @click="selectEvent(event)" @mouseover="active = true" @mouseleave="active = false">
            <h4>
                {{ event.name }}
            </h4>
        </div>
        <div class="mdl-card__supporting-text" v-if="defaultPeriod">
            {{ defaultPeriod.startString }} —<br />
            {{ defaultPeriod.endString }}
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" @click="editEvent(event)">
                Paramétrer
            </a>
            <div class="mdl-layout-spacer"></div>
            <b-confirm @confirm="deleteEvent(event)">
                <a class="mdl-button mdl-js-button mdl-button--icon">
                    <i class="material-icons">delete</i>
                </a>
            </b-confirm>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        event: {
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
        ...mapState({
            periods: state => state.objects.periods
        }),

        defaultPeriod() {
            const defaultPeriod = this.periods.find(
                period => period.id === this.event.defaultPeriod_id
            );

            if (!defaultPeriod) {
                return;
            }

            return {
                ...defaultPeriod,
                startString: moment(defaultPeriod.start).format('DD MMMM YYYY, HH:mm'),
                endString: moment(defaultPeriod.end).format('DD MMMM YYYY, HH:mm')
            };
        }
    },

    methods: {
        selectEvent(event) {
            this.$emit('select', event);
        },
        editEvent(event) {
            this.$emit('edit', event);
        },
        deleteEvent(event) {
            this.$emit('delete', event);
        }
    }
};
</script>

<style>
.tile-card-event.mdl-card {
    width: 256px;
    height: 256px;
    background: #3e4eb8;
}

.tile-card-event > .mdl-card__actions {
    border-color: rgba(255, 255, 255, 0.2);
}

.tile-card-event > .mdl-card__title {
    align-items: flex-start;
    cursor: pointer;
}

.tile-card-event > .mdl-card__title > h4 {
    margin-top: 0;
}

.tile-card-event > .mdl-card__actions {
    display: flex;
    box-sizing: border-box;
    align-items: center;
}

.tile-card-event > .mdl-card__actions > .material-icons {
    padding-right: 10px;
}

.tile-card-event > .mdl-card__title,
.tile-card-event > .mdl-card__supporting-text,
.tile-card-event > .mdl-card__actions,
.tile-card-event > .mdl-card__actions > .mdl-button {
    color: #fff;
}
</style>
