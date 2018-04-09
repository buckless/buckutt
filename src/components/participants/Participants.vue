<template>
    <div class="b-participants b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Privilèges des utilisateurs"
                :tabs="[{ route: '/participants', name: 'Utilisateurs', exact: true }, { route: '/participants/staff', name: 'Staff' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
