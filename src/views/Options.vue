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
                <vue-slider
                    ref="slider"
                    v-model="values[i]"
                    :max="article.maxNumber"
                    :tooltip="false"
                    :piecewise="true"
                    :piecewise-label="true"
                    :clickable="false"
                    :speed="0.1"
                    tooltip-dir="bottom"></vue-slider>
            </Mode>
        </div>
    </div>
</template>

<script>
import vueSlider from 'vue-slider-component/src/vue2-slider.vue';

import Mode from '@/components/Mode';

export default {
    components: {
        Mode,
        vueSlider
    },

    data() {
        const articles = JSON.parse(process.env.VUE_APP_ARTICLES);

        return {
            articles,
            values: articles.map(article => 0),
            selectedArticles: []
        };
    },

    methods: {
        toggle(article) {
            const index = this.isActive(article);

            if (index > -1) {
                this.values[this.articles.indexOf(article)] = 0;
                this.selectedArticles.splice(index, 1);
            } else {
                this.values[this.articles.indexOf(article)] = article.maxNumber;
                setTimeout(() => this.selectedArticles.push(article));
            }
        },

        isActive(article) {
            return this.selectedArticles.findIndex(
                selectedArticle => selectedArticle.id === article.id
            );
        }
    }
};
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
    height: 45px;
    margin-top: 12px;
    padding: 16px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 0 0 2px transparent;
}

.toggle[active] {
    height: auto;
    border-color: #1abc9c;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 0 0 2px #1abc9c;
}

.vue-slider-component {
    opacity: 0;
}

.toggle[active] .vue-slider-component {
    opacity: 1;
}
</style>
