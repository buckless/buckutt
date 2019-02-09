<template>
    <div class="b-articles b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Articles"
                :tabs="[{ route: '/articles', name: 'Liste', exact: true }, { route: '/articles/create', name: 'Création' }]"
                :inCard="true">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
