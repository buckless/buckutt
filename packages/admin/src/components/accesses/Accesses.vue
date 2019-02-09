<template>
    <div class="b-accesses b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Contrôle d'accès"
                :tabs="[{ route: '/accesses', name: 'Historique', exact: true }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
