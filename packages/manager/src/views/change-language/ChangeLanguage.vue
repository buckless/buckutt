<template>
    <ModalLayout :title="$t('views.language.title')" @close="close">
        <template v-slot>
            <div class="languages">
                <Button @click="change('fr')">{{ $t('views.language.fr') }}</Button>
                <Button @click="change('en')">{{ $t('views.language.en') }}</Button>
            </div>
        </template>

        <template v-slot:actions>
            <Button @click="close">{{ $t('common.cancel') }}</Button>
        </template>
    </ModalLayout>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

import Button from 'ui/src/components/Button/Button';
import ModalLayout from '../../layouts/Modal';

export default {
    components: {
        Button,
        ModalLayout
    },

    methods: {
        ...mapActions({
            setLanguage: 'user/setLanguage'
        }),

        ...mapMutations({
            setLanguageModalOpened: 'user/SET_LANGUAGE_MODAL_OPENED'
        }),

        async change(language) {
            await this.setLanguage({ language });
            this.close();
        },

        close() {
            this.setLanguageModalOpened(false);
        }
    }
};
</script>

<style scoped>
.languages {
    display: flex;
    flex-direction: column;
    width: 250px;
    min-height: 150px;
    justify-content: space-around;
}
</style>
