<template>
    <div class="b-fundations b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Fondations"
                :tabs="[{ route: '/fundations', name: 'Liste', exact: true }, { route: '/fundations/create', name: 'Création' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
