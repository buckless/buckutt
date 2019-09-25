import Base from '../base/Base.vue';
import Show from '../base/Show.vue';
import Details from '../base/Details.vue';
import Create from '../base/Create.vue';
import Protip from '../base/Protip.vue';
import Accesses from './Accesses.vue';
import Promotions from './Promotions.vue';

import Manager from './manager/Base.vue';
import Category from './manager/Category.vue';
import CreateCategory from './manager/CreateCategory.vue';
import AddArticle from './manager/AddArticle.vue';
import ArticlePrices from './manager/ArticlePrices.vue';
import RemoveCategory from './manager/RemoveCategory.vue';
import PromotionPrices from './manager/PromotionPrices.vue';

import config from './config';
import addCreate from '../../lib/addCreate';

export default [
    {
        path: '/points',
        props: config,
        component: Base,
        children: [
            {
                path: '',
                props: config,
                component: Protip,
                children: [
                    {
                        path: 'create',
                        props: { default: config, create: config },
                        components: { create: Create }
                    }
                ]
            },
            {
                path: ':point',
                props: config,
                component: Show,
                children: addCreate(Create, [
                    { path: '', props: config, component: Details },
                    { path: 'accesses', props: config, component: Accesses },
                    {
                        path: 'promotions',
                        props: config,
                        component: Promotions,
                        children: [{ path: ':promotion', component: PromotionPrices }]
                    }
                ])
            }
        ]
    },
    {
        path: '/points/:point/categories',
        component: Show,
        props: config,
        children: [
            {
                path: '',
                component: Manager,
                children: [{ path: 'create', component: CreateCategory }]
            },
            {
                path: ':category',
                props: config,
                component: Manager,
                children: [
                    {
                        path: '',
                        component: Category,
                        children: [
                            { path: 'create', component: CreateCategory },
                            { path: 'remove', component: RemoveCategory },
                            { path: 'articles/add', component: AddArticle },
                            { path: 'articles/:article', component: ArticlePrices },
                            { path: 'articles/:article/create', component: CreateCategory }
                        ]
                    }
                ]
            }
        ]
    }
];
