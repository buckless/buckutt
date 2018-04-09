import Categories from './Categories.vue';
import CategoriesCreate from './CategoriesCreate.vue';
import CategoriesList from './CategoriesList.vue';

import CategoryShow from './category/CategoryShow.vue';
import CategoryShowDetails from './category/CategoryShowDetails.vue';
import CategoryEditObject from './category/CategoryEditObject.vue';

export default [
    {
        path: '/categories',
        component: Categories,
        children: [
            { path: '', component: CategoriesList },
            { path: 'create', component: CategoriesCreate }
        ]
    },
    {
        path: '/categories/:category',
        component: CategoryShow,
        children: [
            { path: '', component: CategoryShowDetails },
            { path: 'edit', component: CategoryEditObject }
        ]
    }
];
