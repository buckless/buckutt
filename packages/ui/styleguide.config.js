const path = require('path');
const theme = require('./src/theme.json');

module.exports = {
    require: [path.join(__dirname, 'src/index.js')],
    title: 'Buckless',
    pagePerSection: true,
    usageMode: 'expand',
    exampleMode: 'expand',
    ignore: ['src/components/Tabs/Tab.vue'],
    sections: [
        {
            name: 'General',
            content: 'src/pages/General.md',
            sectionDepth: Infinity,
            sections: [
                {
                    name: 'Colors',
                    content: 'src/pages/Colors.md'
                },
                {
                    name: 'Typography',
                    content: 'src/pages/Typography.md'
                },
                {
                    name: 'Elevations',
                    content: 'src/pages/Elevations.md'
                }
            ]
        },
        {
            name: 'Components',
            sectionDepth: Infinity,
            components: 'src/components/**/*.vue'
        }
    ],
    template: {
        head: {
            links: [
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css?family=Oxygen'
                }
            ]
        }
    },
    theme: {
        color: {
            link: theme.colors.primary['300'],
            linkHover: theme.colors.primary['400'],
            codeBackground: theme.colors.grey['100'],
            border: theme.colors.grey['400'],
            ribbonBackground: theme.colors.grey['300']
        },
        fontFamily: {
            base: 'Oxygen, sans-serif'
        }
    },
    getComponentPathLine(componentPath) {
        const name = path.basename(componentPath, '.vue');
        const dir = path.dirname(componentPath);
        return `import ${name} from 'ui/${dir}/${name}';`;
    }
};
