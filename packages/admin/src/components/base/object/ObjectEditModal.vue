<template>
    <b-container dropShadow @close="back">
        <b-modal :title="title" @close="back" class="b-modal-create">
            <form @submit.prevent="edit" class="b-create">
                <template
                    v-for="entry in list"
                    v-if="!entry.lockEdition && entry.type !== 'hidden'"
                >
                    <b-checkbox
                        v-model="cloneData[entry.field]"
                        :key="entry.field"
                        v-if="entry.type === 'boolean'"
                        >{{ entry.label }}</b-checkbox
                    >
                    <b-datetimeinput
                        v-model="cloneData[entry.field]"
                        :label="entry.label"
                        v-else-if="entry.type === 'date'"
                        :key="entry.field"
                    ></b-datetimeinput>
                    <b-input
                        v-model="cloneData[entry.field]"
                        :label="entry.label"
                        v-else
                        :key="entry.field"
                    ></b-input>
                </template>
                <b-button v-show="false"></b-button>
            </form>
            <template slot="actions">
                <b-button @click="back">Annuler</b-button>
                <b-button raised accent @click="edit">Valider</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import cloneDeep from 'lodash.clonedeep';

export default {
    props: {
        list: {
            type: Array,
            required: true
        },
        data: {
            type: Object,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            cloneData: {}
        };
    },

    methods: {
        edit() {
            this.list
                .filter(entry => entry.compute && !entry.lockEdition)
                .forEach(entry => {
                    this.cloneData[entry.field] = entry.compute(this.cloneData);
                });

            this.$emit('edit', this.cloneData);
            this.back();
        },

        back() {
            this.$router.go(-1);
        }
    },

    created() {
        this.cloneData = cloneDeep(this.data);

        this.list
            .filter(entry => entry.type === 'date')
            .forEach(entry => {
                this.cloneData[entry.field] = new Date(this.cloneData[entry.field]);
            });

        this.list
            .filter(entry => entry.display)
            .forEach(entry => {
                this.cloneData[entry.field] = entry.display(this.cloneData);
            });
    }
};
</script>

<style scoped>
.b-modal-create {
    overflow: visible !important;
}

.b-create {
    & > * {
        margin-top: 15px;
        display: block;
    }
}
</style>
