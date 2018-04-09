<template>
    <div class="b-controller-chooser">
        <h4 v-if="groups.length > 0">Groupes :</h4>
        <div class="b-controller-chooser__groups" v-if="groups.length > 0">
            <div class="b-controller-chooser__groups__group" v-for="group in groups">
                <input type="checkbox" name="group" class="b--out-of-screen" :id="group.id" v-model="activeGroups" :value="group">
                <label :for="group.id">
                    {{ group.name }}
                </label>
            </div>
        </div>
        <div v-else>
            <p>Aucun groupe créé</p>
        </div>
        <button class="b-controller-chooser__cancel" @click="cancel">Annuler</button>
        <button @click="ok">Valider</button>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: ['defaultGroups'],

    data() {
        return {
            activeGroups: this.defaultGroups
        };
    },

    methods: {
        ok() {
            this.$emit('groups', this.activeGroups);
        },

        cancel() {
            this.$emit('cancel');
        }
    },

    computed: mapState({
        groups: state =>
            app.$store.state.auth.groups.filter(
                group => group.name !== app.$store.state.auth.device.event.name
            )
    })
};
</script>

<style>
@import '../main.css';

.b-controller-chooser {
    position: absolute;
    top: 112px;
    left: 0;
    right: 0;
    height: calc(100% - 112px);
    background: #fafafa;
}

.b-controller-chooser__groups {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.12);
}

.b-controller-chooser__groups__group {
    &:first-child > label {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }

    &:last-child > label {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    & > label {
        display: block;
        width: 100%;
        padding: 10px;
        font-weight: 500;
        background-color: #fff;
        cursor: pointer;

        &:not(:last-child) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        }
    }

    & > input:checked + label {
        background-color: #2980b9;
        color: #fff;
    }
}

.b-controller-chooser button {
    margin: 32px 0 18px 0;
    background-color: $green;
    color: #fff;
    cursor: pointer;
    padding: 12px 20px;
    border: 0;
    text-transform: uppercase;
    border-radius: 3px;

    &.b-controller-chooser__cancel {
        background-color: $orange;
    }
}
</style>
