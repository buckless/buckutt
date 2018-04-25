<template>
    <div class="b-checkbox-container">
        <div class="mdc-checkbox">
            <input type="checkbox"
                 :id="id"
                 :value="value"
                 @change="blur"
                 ref="checkbox"
                 v-model="model"
                 class="mdc-checkbox__native-control"/>
            <div class="mdc-checkbox__background">
                <svg class="mdc-checkbox__checkmark"
                     viewBox="0 0 24 24">
                  <path class="mdc-checkbox__checkmark-path"
                        fill="none"
                        stroke="white"
                        d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                </svg>
                <div class="mdc-checkbox__mixedmark"></div>
            </div>
        </div>
        <label :for="id">
            <slot></slot>
        </label>
    </div>
</template>

<script>
export default {
    model: {
        prop: 'checked',
        event: 'change'
    },

    props: {
        id: {
            type: String,
            required: true
        },

        value: {
            required: false
        },

        checked: [Array, Boolean]
    },

    methods: {
        blur() {
            this.$refs.checkbox.blur()
        }
    },

    computed: {
        model: {
            get() {
                return this.checked;
            },

            set(check) {
                this.$emit('change', check);
            }
        }
    }
};
</script>
