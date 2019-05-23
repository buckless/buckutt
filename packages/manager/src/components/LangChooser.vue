<template>
    <div class="lang-chooser">
        <a v-if="currentLang === 'fr'" @click="changeLang('en')">English version</a>
        <a v-else @click="changeLang('fr')">Version française</a>
    </div>
</template>

<script>
export default {
    name: 'LangChooser',

    methods: {
        changeLang(lang) {
            localStorage.setItem('buckless/manager/user/lang', lang);
            location.reload();
        }
    },

    computed: {
        currentLang() {
            return (
                localStorage.getItem('buckless/manager/user/lang') ||
                navigator.language.split('-')[0]
            );
        }
    },

    mounted() {
        if (!localStorage.getItem('buckless/manager/user/lang')) {
            localStorage.setItem('buckless/manager/user/lang', navigator.language.split('-')[0]);
        }
    }
};
</script>

<style lang="scss" scoped>
.lang-chooser {
    width: 200px;
    margin: auto;
    text-align: center;
    cursor: pointer;
    margin-top: 5px;
}
</style>
