<template>
    <div class="b-detailedSwitch mdl-card" :class="{ 'mdl-shadow--2dp': !active, 'mdl-shadow--6dp': active }" @mouseover="active = true" @mouseleave="active = false" @click="update(!value)">
        <div class="b-detailedSwitch_icon" :class="{ 'mdl-color--green': value, 'mdl-color--orange': !value }">
            <i class="material-icons">{{ icon }}</i>
        </div>
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">{{ label }}</h2>
        </div>
        <div class="mdl-card__supporting-text">
            <slot></slot>
        </div>
        <div class="mdl-card__menu">
            <span class="mdl-chip" :class="{ 'mdl-color--green': value, 'mdl-color--orange': !value }">
                <strong class="mdl-chip__text" v-if="value">Actif</strong>
                <strong class="mdl-chip__text" v-else>Inactif</strong>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        label: String,
        icon: String,
        value: Boolean
    },

    data() {
        return {
            active: false
        };
    },

    methods: {
        update(e) {
            this.$emit('input', e);
        }
    }
};
</script>

<style>
.b-detailedSwitch {
    cursor: pointer;
    margin-top: 15px;
    margin-bottom: 15px;
    width: 100%;
    flex-direction: column;
    padding-left: 160px;
    min-height: 160px;

    & > .b-detailedSwitch_icon {
        position: absolute;
        width: 120px;
        height: 120px;
        text-align: center;
        top: 0px;
        bottom: 0px;
        left: 0px;
        margin: auto 0px auto 20px;

        & > i {
            margin-top: 20px;
            width: 80px;
            height: 80px;
            font-size: 80px;
            color: white;
        }
    }
}
</style>
