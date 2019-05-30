import Vue from 'vue';
import Color from './docs-components/Color.vue';
import FontSize from './docs-components/FontSize.vue';
import Elevation from './docs-components/Elevation.vue';
// do not make theme variables parsed by postcss in styleguide as they are removed from
// css output
import theme from '!!raw-loader!./theme.css';

// enfoce font-family
const style = document.createElement('style');
style.innerHTML = `
    ${theme}

    * { box-sizing: border-box; }

    body {
        font-family: var(--typography-family) !important;
    }

    [data-preview] {
        font-family: var(--typography-family) !important;
    }
`;
document.head.appendChild(style);

// mock router-link
Vue.component('router-link', {
    props: {
        tag: {
            type: String,
            default: 'a'
        }
    },
    template: `<component :is="tag"><slot/></component>`
});

// global docs components
Vue.component('Color', Color);
Vue.component('FontSize', FontSize);
Vue.component('Elevation', Elevation);
