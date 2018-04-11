<template>
    <div class="b-events b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Options de l'événement"
                :tabs="[{ route: '', name: 'Détails', exact: true }, { route: 'edit', name: 'Édition' }, { route: 'config', name: 'Configuration' }]"
                :inCard="true"
                :goBack="false"
                :level="2">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
