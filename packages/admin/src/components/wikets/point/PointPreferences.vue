<template>
    <div class="b-wikets-preferences">
        <h5>Préférences</h5>
        <form @submit.prevent="updatePoint(focusedPoint)">
            <div>
                <b-inputselect
                    label="Groupe par défaut préféré"
                    id="group-select"
                    :options="groupOptions"
                    :value="focusedPoint.defaultGroup"
                    @input="updateDeepestFocusedElement({ field: 'defaultGroup', value: $event })"
                ></b-inputselect>
                <i class="material-icons" id="grouptip">info</i>
                <mdl-tooltip target="grouptip"
                    >Groupe qui sera pré-rempli par défaut lors de l'assignement des
                    équipements.</mdl-tooltip
                >
            </div>
            <mdl-button colored raised>Modifier</mdl-button>
        </form>
    </div>
</template>

<script>
import pick from 'lodash.pick';
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
    methods: {
        ...mapActions(['updateObject', 'updateDeepestFocusedElement', 'notify', 'notifyError']),

        updatePoint(point) {
            const newPoint = {
                id: point.id
            };

            if (this.focusedPoint.defaultGroup) {
                newPoint.defaultGroup_id = point.defaultGroup.id;
            }

            const fields = ['id', 'defaultGroup_id'];

            this.updateObject({ route: 'points', value: pick(newPoint, fields) })
                .then(() =>
                    this.notify({
                        message: 'Les préférences du guichet ont bien été modifiées'
                    })
                )
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification des préférences',
                        full: err
                    })
                );
        }
    },
    computed: {
        ...mapState({
            focusedPoint: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['groupOptions'])
    }
};
</script>

<style>
.b-wikets-preferences {
    & > form > div {
        display: flex;
        align-items: center;

        & > i {
            margin-left: 5px;
        }
    }
}
</style>
