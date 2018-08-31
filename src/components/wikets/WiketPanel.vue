<template>
    <div class="b-wiketpanel">
        <div class="b-wiketpanel__add">
            <i class="material-icons">note_add</i>
            <h6>Créer un guichet</h6>
        </div>
        <div class="b-wiketpanel__addwiket">
            <form @submit.prevent="createPoint(newPoint)">
                <mdl-textfield floating-label="Nom" v-model="newPoint.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>
                <mdl-button colored raised>Créer</mdl-button>
            </form>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newPoint: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createPoint(point) {
            this.createObject({ route: 'points', value: point })
                .then(() => {
                    this.notify({ message: 'Le guichet a bien été créé' });
                    this.newPoint.name = '';
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création du guichet',
                        full: err
                    })
                );
        }
    }
};
</script>

<style>
.b-wiketpanel {
    display: flex;
    flex-wrap: wrap;
    padding-top: 20px;
    justify-content: space-between;

    & > .b-wiketpanel__add {
        width: 180px;
        text-align: center;
        margin-right: 20px;
        color: #222;

        & > i {
            font-size: 50px;
        }

        & > h6 {
            margin-top: 0;
            font-size: 14px;
        }
    }

    & > .b-wiketpanel__addwiket {
        display: flex;
        align-items: center;
        flex: 1;

        & > form {
            & > button {
                margin-left: 10px;
                margin-top: -10px;
            }
        }
    }
}
</style>
