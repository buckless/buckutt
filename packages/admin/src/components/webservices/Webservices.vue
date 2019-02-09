<template>
    <div class="b-webhooks b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Webhooks"
                :tabs="[{ route: '/webservices', name: 'Liste', exact: true }, { route: '/webservices/create', name: 'Création' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
