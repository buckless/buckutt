<template>
    <div class="b-giftreloads b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Offres de rechargement"
                :tabs="[
                    { route: '/giftreloads', name: 'Liste', exact: true },
                    { route: '/giftreloads/create', name: 'Création' }
                ]"
                :inCard="true"
            >
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
