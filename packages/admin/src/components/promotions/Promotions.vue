<template>
    <div class="b-promotions b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Formules"
                :tabs="[{ route: '/promotions', name: 'Liste', exact: true }, { route: '/promotions/create', name: 'Création' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
