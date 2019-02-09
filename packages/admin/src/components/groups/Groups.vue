<template>
    <div class="b-groups b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Groupes"
                :tabs="[{ route: '/groups', name: 'Liste', exact: true }, { route: '/groups/create', name: 'Création' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
