<template>
  <div class="checkbox-wrapper">
    <div class="mdc-checkbox">
      <input
        :id="checkboxId"
        :checked="checked"
        type="checkbox"
        class="mdc-checkbox__native-control"
        @change="$emit('change', $event.target.checked)">
      <div class="mdc-checkbox__background">
        <svg
          class="mdc-checkbox__checkmark"
          viewBox="0 0 24 24">
          <path
            class="mdc-checkbox__checkmark-path"
            fill="none"
            d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
        </svg>
        <div class="mdc-checkbox__mixedmark"/>
      </div>
    </div>
    <label :for="checkboxId">
      <slot/>
    </label>
  </div>
</template>

<script>
export default {
    name: 'Checkbox',

    model: {
        prop: 'checked',
        event: 'change'
    },

    props: {
        checked: { type: Boolean, default: false },
        id: { type: String, required: true }
    },

    computed: {
        checkboxId() {
            return `checkbox-${this.id}`;
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@material/checkbox/mixins';
@import '@/theme.scss';

.checkbox-wrapper {
    display: flex;
    align-items: center;
}

.mdc-checkbox {
    @include mdc-checkbox-base_;
    @include mdc-checkbox-container-colors($foregroundTheme, transparent, $theme);
    @include mdc-checkbox-ink-color($foregroundTheme);
    @include mdc-checkbox-focus-indicator-color($theme);
    @include mdc-checkbox-disabled-container-color_;
}

.mdc-checkbox--disabled {
    @include mdc-checkbox--disabled_;
}

.mdc-checkbox__background {
    @include mdc-checkbox__background_;
}

.mdc-checkbox__checkmark {
    @include mdc-checkbox__checkmark_;
}

.mdc-checkbox__checkmark-path {
    @include mdc-checkbox__checkmark-path_;
}

.mdc-checkbox__mixedmark {
    @include mdc-checkbox__mixedmark_;
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background {
    @include mdc-checkbox__background--marked_;

    .mdc-checkbox__checkmark-path {
        @include mdc-checkbox__checkmark-path--marked_;
    }
}

.mdc-checkbox__background::before {
    @include mdc-checkbox__focus-indicator_;
}

.mdc-checkbox__native-control:focus ~ .mdc-checkbox__background::before {
    @include mdc-checkbox__focus-indicator--focused_;
}

.mdc-checkbox__native-control {
    @include mdc-checkbox__native-control_;

    &:disabled {
        @include mdc-checkbox--disabled_;
    }
}

.mdc-checkbox__native-control:checked ~ .mdc-checkbox__background {
    .mdc-checkbox__checkmark {
        @include mdc-checkbox__checkmark--checked_;
    }

    .mdc-checkbox__mixedmark {
        @include mdc-checkbox__mixedmark--checked_;
    }
}
</style>
