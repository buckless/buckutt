<template>
    <div class="b-autocomplete">
        <label class="mdc-text-field" ref="content">
            <input type="text" class="mdc-text-field__input" required v-model="content" @input="changeInput(content)">
            <span class="mdc-text-field__label">{{ label }}</span>
            <div class="mdc-text-field__bottom-line"></div>
        </label>
        <ul class="mdc-list b-autocomplete__list" v-if="isOpen">
            <li
                class="mdc-list-item"
                :tabindex="index" v-for="(suggestion, index) in displayedSuggestions"
                @click="select(suggestion)">
                {{ suggestion.name }}
            </li>
        </ul>
    </div>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapActions, mapState } from 'vuex';
import debounce from 'lodash.debounce';

export default {
    props: {
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            content: '',
            open: false
        };
    },

    computed: {
        ...mapState({
            users: state => state.app.users
        }),

        displayedSuggestions() {
            return this.users.map(user => ({
                name: `${user.firstname} ${user.lastname}`,
                id: user.id
            }));
        },

        isOpen() {
            return (
                this.displayedSuggestions.length > 0 &&
                this.open === true &&
                this.content.length > 0
            );
        }
    },

    methods: {
        ...mapActions(['searchUsers']),

        select(suggestion) {
            this.content = suggestion.name;
            this.open = false;
            this.$emit('input', suggestion);
        },

        changeInput(content) {
            this.searchUsers(content);
            this.open = true;
            this.$emit('input', undefined);
        }
    },

    mounted() {
        const searchUsers = this.searchUsers;
        this.searchUsers = debounce(name => searchUsers(name), 200);

        MDCTextField.attachTo(this.$refs.content);
    }
};
</script>

<style lang="scss">
@import '@material/elevation/mixins';

.b-autocomplete {
    width: 100%;
    position: relative;
}

.b-autocomplete__list.mdc-list {
    @include mdc-elevation(2);

    position: absolute;
    width: 100%;
    margin-top: -8px;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.12);
    z-index: 5;
}

.b-autocomplete .mdc-list-item {
    cursor: pointer;
    text-transform: capitalize;
}
</style>
