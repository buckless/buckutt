<template>
    <div class="b-inputselect mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select" ref="textfield">
        <input
            type="text"
            class="mdl-textfield__input b-inputselect__field"
            :id="id"
            v-model="content"
            @input="changeInput(content)"
            @focus="displayInput = true"
            @blur="displayInput = false"
            @keydown.up.prevent.stop="up()"
            @keydown.down.prevent.stop="down()"
            @keydown.enter.prevent.stop="select(suggestions[activeIndex].original)"
            ref="input"
            autocomplete="off" />
        <label :for="id">
            <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i>
        </label>
        <label class="mdl-textfield__label" :for="id">{{ label }}</label>
        <transition name="slide-top">
            <ul
                :for="id"
                class="b-completelist mdl-shadow--2dp"
                ref="menu"
                v-if="displayInput">
                <li
                    v-for="(suggestion, index) in suggestions"
                    @mousedown="select(suggestion.original)"
                    @mouseover="activeIndex = index"
                    class="b-completelist__item"
                    :class="{ 'b-completelist__item-active': (index === activeIndex) }"
                    v-html="suggestion.string">
                </li>
            </ul>
        </transition>
    </div>
</template>

<script>
import fuzzy from 'fuzzy';

export default {
    props: {
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        options: {
            type: Array,
            required: true
        },
        fullOptions: {
            type: Array,
            required: false
        },
        value: {
            required: false
        },
        disableAutoselect: {
            type: Boolean,
            required: false
        }
    },

    data() {
        return {
            content: '',
            displayInput: false,
            activeIndex: 0,
            ignoreNextUpdate: false
        };
    },

    computed: {
        suggestions() {
            const strongify = { extract: el => el.name, pre: '<strong>', post: '</strong>' };
            const db = this.convertOptions(this.database);
            const opts = this.convertOptions(this.options);

            return this.content
                ? fuzzy.filter(this.content, db, strongify)
                : opts.map(entry => ({ original: entry, string: entry.name }));
        },

        database() {
            return this.fullOptions ? this.fullOptions : this.options;
        }
    },

    methods: {
        select(suggestion) {
            this.$refs.textfield.MaterialTextfield.change(suggestion.name);
            this.$refs.textfield.MaterialTextfield.boundBlurHandler();
            this.$refs.input.blur();

            this.content = suggestion.name;
            this.displayInput = false;
            this.ignoreNextUpdate = true;

            this.$emit('input', suggestion.value);
        },

        changeInput(content) {
            if (!this.suggestions[0]) {
                return;
            }

            const firstName = this.suggestions[0].original.name.toLowerCase();

            if (this.suggestions.length === 1 && firstName === content.toLowerCase()) {
                return this.select(this.suggestions[0].original);
            }

            this.ignoreNextUpdate = true;
            this.$emit('input', undefined);
        },

        convertOptions(options) {
            return options.map(
                option => (!option.name && !option.value ? { name: option, value: option } : option)
            );
        },

        down() {
            if (this.activeIndex + 1 >= this.suggestions.length) {
                return;
            }

            this.activeIndex += 1;

            const menu = this.$refs.menu;
            const activeItemBottomOffset =
                (this.activeIndex + 1) * menu.children[0].offsetHeight - menu.scrollTop;

            if (activeItemBottomOffset > menu.offsetHeight) {
                menu.scrollTop += menu.children[0].offsetHeight;
            }
        },

        up() {
            if (this.activeIndex <= 0) {
                return;
            }

            this.activeIndex -= 1;

            const menu = this.$refs.menu;
            const activeItemTopOffset =
                this.activeIndex * menu.children[0].offsetHeight - menu.scrollTop;

            if (activeItemTopOffset < 0) {
                menu.scrollTop -= menu.children[0].offsetHeight;
            }
        }
    },

    mounted() {
        componentHandler.upgradeElements(this.$el);

        if (this.suggestions.length === 1 && !this.disableAutoselect) {
            this.select(this.suggestions[0].original);
        }

        if (this.value) {
            const object = this.suggestions.find(
                suggestion =>
                    JSON.stringify(this.value) === JSON.stringify(suggestion.original.value)
            );

            if (object) {
                this.select(object.original);
            }
        }
    },

    watch: {
        value(newValue) {
            if (this.ignoreNextUpdate) {
                this.ignoreNextUpdate = false;
                return;
            }

            const object = this.suggestions.find(
                suggestion => JSON.stringify(newValue) === JSON.stringify(suggestion.original.value)
            );

            if (object) {
                this.select(object.original);
            } else {
                this.content = newValue;
                this.$refs.textfield.MaterialTextfield.change(newValue);
            }
        }
    }
};
</script>

<style>
.b-inputselect .mdl-icon-toggle__label {
    float: right;
    margin-top: -30px;
    color: rgba(0, 0, 0, 0.4);
}

.b-inputselect.is-focused .mdl-icon-toggle__label {
    color: #3f51b5;
}

.b-inputselect__field {
    padding-right: 30px;
}

.b-completelist {
    width: 100%;
    background: white;
    position: absolute;
    z-index: 1000;
    margin-top: 0px;
    margin-bottom: 0px;
    list-style: none;
    padding: 0;
    color: black;
    max-height: 288px;
    overflow: auto;
    transition: 0.2s opacity ease-out, 0.2s transform ease-out;
}

.b-completelist__item {
    display: block;
    position: relative;
    height: 48px;
    line-height: 48px;
    padding-left: 10px;
    cursor: pointer;
    font-size: 16px;
    padding: 0 16px;
    overflow-y: hidden;
}

.b-completelist__item-active {
    background: #eeeeee;
    transition: all 0.1s ease-in-out;
}

.slide-top-enter,
.slide-top-leave-to {
    opacity: 0;
    transform: translateY(-15px) scale(0.8);
    transform-origin: top left;
}

.slide-top-leave,
.slide-top-enter-to {
    opacity: 1;
    transform: translateY(0) scale(1);
    transform-origin: top left;
}
</style>
