<template>
    <div class="b-periods">
        <b-dswitch
            :label="dswitch.title"
            :icon="dswitch.icon"
            :checked="event[this.eventField]"
            @change="updateElement"
            v-if="this.eventField && this.dswitch"
        >
            {{ dswitch.subtitle }}
        </b-dswitch>

        <template v-if="!this.eventField || event[this.eventField]">
            <b-pagination :rows="displayedObjects" v-slot="{ rows }">
                <b-table :rows="rows" @click="editBank" @action="startRemoveBank" />
            </b-pagination>

            <div class="b-actions" v-if="createButton">
                <div class="b--flexspacer"></div>
                <b-button raised :to="`/events/${this.category}/${this.model}/create`">{{
                    createButton
                }}</b-button>
            </div>

            <router-view></router-view>
            <b-confirm ref="confirm" @confirm="removeBank"></b-confirm>
        </template>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
    props: {
        category: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        display: {
            type: Function,
            required: true
        },
        dswitch: {
            type: Object,
            required: false
        },
        eventField: {
            type: String,
            required: false
        },
        createButton: {
            type: String,
            required: false
        },
        notifications: {
            type: Object,
            default: {
                error: 'Erreur inconnue'
            }
        }
    },

    computed: {
        ...mapState({
            objectsRaw(state) {
                return state.api[this.model].allIds.map(id => state.api[this.model].values[id]);
            }
        }),

        ...mapGetters(['event']),

        displayedObjects() {
            return this.display(this.objectsRaw).map(object => ({
                ...object,
                rightIcon: 'delete'
            }));
        }
    },

    methods: {
        ...mapActions(['updateObject', 'removeObject', 'notify']),

        updateElement(bool) {
            const value = { id: this.event.id };
            value[this.eventField] = bool;
            this.updateObject({ route: 'events', value });
        },

        editBank(id) {
            this.$router.push(`/events/${this.category}/${this.model}/${id}`);
        },

        startRemoveBank(id) {
            this.bankId = id;
            this.$refs.confirm.opened = true;
        },

        async removeBank() {
            try {
                await this.removeObject({ route: this.model, value: { id: this.bankId } });
                this.notify(this.notifications.delete);
            } catch {
                this.notify(this.notifications.error);
            }
        }
    }
};
</script>

<style scoped>
.b-actions {
    display: flex;
    margin-top: 15px;
}
</style>
