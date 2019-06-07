<template>
    <div class="b-meansofpayment b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                title="Moyens de paiement"
                :tabs="[
                    { route: '/meansofpayment', name: 'Liste', exact: true },
                    { route: '/meansofpayment/create', name: 'Création' }
                ]"
                :inCard="true"
            >
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>
