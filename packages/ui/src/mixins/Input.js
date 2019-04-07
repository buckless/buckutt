export default {
    model: {
        prop: 'value',
        event: 'input'
    },

    props: {
        /**
         * Text label above the input
         */
        label: { type: String, default: '' },
        /**
         * Input type (text, email, number, etc.)
         */
        type: { type: String, default: 'text' },
        /**
         * Placeholder when input value is null
         */
        placeholder: { type: String, default: '' },
        /**
         * Disable the input
         */
        disabled: { type: Boolean, disabled: false },
        /**
         * Smaller input
         */
        small: { type: Boolean, default: false },
        /**
         * @model
         * Controls the input value
         */
        value: { type: String, default: '' },
        /**
         * Maximum length for text inputs
         */
        maxlength: { type: Number },
        /**
         * Regex pattern for text inputs
         */
        pattern: { type: String },
        /**
         * Step for (decimal) number inputs
         */
        step: { type: Number },
        /**
         * Minimum value for number inputs
         */
        min: { type: Number },
        /**
         * Maximum value for number inputs
         */
        max: { type: Number },
        /**
         * Adds elevation to input
         */
        elevation: { type: Boolean }
    },

    mounted() {
        if (this.autofocus) {
            this.$el.children[1].focus();
        }
    }
};
