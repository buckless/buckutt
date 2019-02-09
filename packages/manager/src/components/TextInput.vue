<template>
    <div class="input-wrapper">
        <template v-if="!label">
            <input
                ref="input"
                :type="type"
                :placeholder="placeholder"
                :disabled="disabled"
                :value="value"
                :maxlength="maxlength"
                :pattern="pattern"
                :step="step"
                :min="min"
                class="input"
                @input="input"
                @keydown="keydown"
                @keyup="keyup"
            />
        </template>
        <template v-else>
            <label>
                <span class="label-text">{{ label }}</span>
                <input
                    ref="input"
                    :type="type"
                    :placeholder="placeholder"
                    :disabled="disabled"
                    :value="value"
                    :maxlength="maxlength"
                    :pattern="pattern"
                    :step="step"
                    :min="min"
                    class="input"
                    @input="input"
                    @keydown="keydown"
                    @keyup="keyup"
                />
            </label>
        </template>
    </div>
</template>

<script>
export default {
    name: 'TextInput',

    props: {
        placeholder: { type: String, default: null },
        value: { type: String, default: null },
        pattern: { type: String, default: null },
        maxlength: { type: String, default: null },
        min: { type: String, default: null },
        type: { type: String, default: 'text' },
        label: { type: String, default: null },
        autofocus: { type: Boolean, default: null },
        disabled: { type: Boolean, default: null },
        step: { type: String, default: null }
    },

    mounted() {
        if (this.autofocus) {
            this.$refs.input.focus();
        }
    },

    methods: {
        input(e) {
            this.$emit('input', e.target.value);
        },

        keydown(...args) {
            this.$emit('keydown', ...args);
        },

        keyup(...args) {
            this.$emit('keyup', ...args);
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';
@import '@material/button/mdc-button';

.input {
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid transparent;
    outline: 0;
    display: block;
    font-size: 0.9rem;
    height: 36px;
    padding: 0 0.5rem;
    width: 100%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.input:focus {
    border-color: $theme;
    transition: 0.1s ease border-color;
}

.input[type='password'] {
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 0.4rem;
}

.input::placeholder {
    font-size: 1rem;
    color: #888;
    text-shadow: none;
    letter-spacing: initial;
}

.label-text {
    display: block;
    font-size: 0.9rem;
    color: $theme;
}

.label-text + .input {
    margin-top: 6px;
}
</style>
