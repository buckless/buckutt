<template>
    <div class="b-users b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Utilisateurs"
                :tabs="[
                    { route: '/users', name: 'Liste', exact: true },
                    { route: '/users/create', name: 'Création' },
                    { route: '/users/staff', name: 'Staff' }
                ]"
                :inCard="true"
            >
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
