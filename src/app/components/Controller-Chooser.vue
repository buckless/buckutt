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
        <button @click="ok">Valider</button>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    data() {
        return {
            activeGroups: []
        }
    },

    methods: {
        ok() {
            this.$emit('groups', this.activeGroups);
        }
    },

    computed: mapState({
        groups: state => app.$store.state.auth.groups
            .filter(group => group.name !== 'Défaut' && group.name !== app.$store.state.auth.device.event.name)
    })
}
</script>

<style>
@import '../main.css';

.b-controller-chooser {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: #fafafa;
}

.b-controller-chooser__groups__group {
    & > label {
        display: block;
        width: 100%;
        padding: 10px;
        font-weight: 500;
    }

    & > input:checked + label {
        background-color: #2980b9;
        color: #fff;
    }
}

.b-controller button {
    margin: 32px 0 18px 0;
    background-color: var(--green);
    color: #fff;
    cursor: pointer;
    padding: 12px 20px;
    border: 0;
    text-transform: uppercase;
    border-radius: 3px;
}

</style>
