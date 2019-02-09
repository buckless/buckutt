<template>
    <div class="b-treasury b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Rechargements"
                :tabs="[{ route: '/treasury', name: 'Afficher', exact: true }, { route: '/treasury/export', name: 'Exporter' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
