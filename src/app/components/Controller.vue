<template>
    <div class="b-controller">
        <chooser v-if="chooser" @groups="setGroups"/>
        <button @click="chooser = true">Changer de groupe</button>
        <p>
            <strong>Groupe(s) actuel(s)</strong> :
            <br/>
            <span class="b-controller-group" v-for="group in currentGroups">{{ group.name }}</span>
            <span v-if="currentGroups.length === 0">Aucun groupe sélectionné</span>
            <br/>
            <br/>
            <br/>
            Scannez une carte pour vérifier son accès
        </p>
    </div>
</template>

<script>
import Chooser from './Controller-Chooser'

export default {
    components: {
        Chooser
    },

    data() {
        return {
            chooser: false,
            currentGroups: [  ]
        }
    },

    methods: {
        setGroups(groups) {
            this.currentGroups = groups;
            this.chooser = false;
        }
    }
}
</script>

<style>
@import '../main.css';

.b-controller {
    width: 100%;
    position: relative;
    background-color: #fafafa;
    text-align: center;
}

.b-controller button {
    margin: 32px 0 18px 0;
    background-color: var(--lightblue);
    color: #fff;
    cursor: pointer;
    padding: 12px 20px;
    border: 0;
    text-transform: uppercase;
    border-radius: 3px;
}

.b-controller p {
    margin-top: 0;
    padding: 0 18px;
}

.b-controller-group:not(:last-of-type):after {
    content: ', ';
}
</style>
