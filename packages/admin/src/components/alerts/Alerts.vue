<template>
    <div class="b-alerts b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Alertes"
                :tabs="[
                    { route: '/alerts', name: 'Historique', exact: true },
                    { route: '/alerts/create', name: 'Nouvelle' }
                ]"
                :inCard="true"
            >
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
