import Articles from './Articles.vue';
import ArticlesCreate from './ArticlesCreate.vue';
import ArticlesList from './ArticlesList.vue';

import ArticleShow from './article/ArticleShow.vue';
import ArticleShowDetails from './article/ArticleShowDetails.vue';
import ArticleEditObject from './article/ArticleEditObject.vue';

export default [
    {
        path: '/articles',
        component: Articles,
        children: [
            { path: '', component: ArticlesList },
            { path: 'create', component: ArticlesCreate }
        ]
    },
    {
        path: '/articles/:article',
        component: ArticleShow,
        children: [
            { path: '', component: ArticleShowDetails },
            { path: 'edit', component: ArticleEditObject }
        ]
    }
];
