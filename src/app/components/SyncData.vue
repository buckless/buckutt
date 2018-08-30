<template>
    <div class="b-sync">
        <div class="b-sync__title">
            <i class="b-icon">{{ icon }}</i>
            <slot></slot>
        </div>
        <div class="b-sync__text">
            <div>
                Dernière synchronisation<br />
                <i v-if="!running">{{ lastUpdate | date }}</i>
                <strong v-else>En cours</strong>
            </div>
            <div>
                Fréquence<br />
                <i>{{ frequency }}</i>
            </div>
        </div>
        <div class="b-sync__icon" @click="$emit('update')">
            <i class="b-icon">sync</i>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        icon: String,
        lastUpdate: Date,
        running: Boolean,
        frequency: String
    },

    filters: {
        date: date => {
            if (!date) {
                return 'Non disponible';
            }

            const day = `0${date.getDate()}`.slice(-2);
            const month = `0${date.getMonth() + 1}`.slice(-2);
            const year = date.getFullYear();

            const hour = `0${date.getHours()}`.slice(-2);
            const minutes = `0${date.getMinutes()}`.slice(-2);

            return `${day}/${month}/${year} ${hour}:${minutes}`;
        }
    }
};
</script>

<style>
@import '../main.css';

.b-sync {
    display: flex;
    flex-wrap: wrap;
    width: 350px;
    height: 110px;
    margin: 10px 10px;
    font-size: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    & > .b-sync__title {
        width: 350px;
        height: 35px;
        background: #fff;
        margin-bottom: 1px;
        display: flex;
        align-items: center;
        font-weight: bold;

        & > i {
            margin: 0px 7px;
        }
    }

    & > .b-sync__icon {
        flex: 1;
        background: #fff;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        & > i {
            font-size: 30px;
        }
    }

    & > .b-sync__text {
        flex: 3;
        margin-right: 1px;

        & > div {
            height: 39.5px;
            line-height: 18px;
            padding-top: 2px;
            background: #fff;

            &:first-child {
                margin-bottom: 1px;
            }
        }
    }
}
</style>
