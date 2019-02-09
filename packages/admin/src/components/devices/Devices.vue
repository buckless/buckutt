<template>
    <div class="b-devices b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Équipements"
                :tabs="[{ route: '/devices', name: 'Liste', exact: true }, { route: '/devices/create', name: 'Création' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
