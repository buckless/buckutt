<template>
    <div class="options">
        <h2>Gérer les options d'une carte</h2>
        <p>Choisissez les options souhaitées, puis scannez une carte</p>
        <div class="toggles">
            <Mode
                v-for="(article, i) in articles"
                class="toggle"
                :active="isActive(article) > -1"
                :key="i"
                @click.native="toggle(article)">
                <strong>{{ article.name }}</strong>
            </Mode>
        </div>
    </div>
</template>

<script>
import Mode from '@/components/Mode'

export default {
    components: {
        Mode
    },

    data() {
        return {
            articles: JSON.parse(process.env.VUE_APP_ARTICLES),
            selectedArticles: [

            ]
        }
    },

    methods: {
        toggle(article) {
            const index = this.isActive(article)

            if (index > -1) {
                this.selectedArticles.splice(index, 1)
            } else {
                setTimeout(() => this.selectedArticles.push(article))
            }
        },

        isActive(article) {
            return this.selectedArticles.findIndex(selectedArticle => selectedArticle.id === article.id)
        }
    }
}
</script>

<style scoped>
h2 {
    text-align: center;
}

p {
    margin-bottom: 0;
    padding: 0 12px;
    text-align: justify;
}

.toggles {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.toggle {
    width: 100%;
    margin-top: 12px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,.12),
          inset 0 0 0 2px transparent;
}

.toggle[active] {
    border-color: #1abc9c;
    box-shadow: 0 2px 4px rgba(0,0,0,.12),
          inset 0 0 0 2px #1abc9c;
}
</style>
