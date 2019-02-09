<template>
    <div class="b-periods b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Périodes"
                :tabs="[{ route: '/periods', name: 'Liste', exact: true }, { route: '/periods/create', name: 'Création' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
