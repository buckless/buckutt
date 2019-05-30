const fs = require('fs-extra');
const path = require('path');
const theme = require('../src/theme.json');

function makeVariables(key, value) {
    if (typeof value === 'string' || typeof value === 'number') {
        return [`--${key}: ${value};`];
    }

    if (typeof value === 'object') {
        return Object.keys(value)
            .map(innerKey => makeVariables(`${key}-${innerKey}`, value[innerKey]))
            .flat();
    }
}

function makeElevations() {
    const elevations = [];

    for (let [dp, shadows] of Object.entries(theme.elevations)) {
        const shadowsValues = Object.values(shadows);
        elevations.push(`--elevation-${dp}: ${shadowsValues.join(', ')};`);
    }

    return elevations;
}

async function main() {
    const content = [];

    content.push(makeVariables('radius', theme.radius), '');
    content.push(makeVariables('transition', theme.transition), '');
    content.push(makeVariables('foreground', theme.colors.foreground), '');
    content.push(makeVariables('grey', theme.colors.grey), '');
    content.push(makeVariables('black', theme.colors.black), '');
    content.push(makeVariables('primary', theme.colors.primary), '');
    content.push(makeVariables('accent', theme.colors.accent), '');
    content.push(makeVariables('error', theme.colors.error), '');
    content.push(makeVariables('warning', theme.colors.warning), '');
    content.push(makeVariables('success', theme.colors.success), '');
    content.push(makeVariables('typography', theme.typography), '');
    content.push(makeElevations(), '');

    const themeFile = [
        '@import "./mixins.css";',
        '',
        ':root {',
        content
            .flat()
            .map(line => `    ${line}`.trimRight())
            .join('\n'),
        '}',
        ''
    ];

    await fs.writeFile(path.join(__dirname, '..', 'src', 'theme.css'), themeFile.join('\n'));
}

main();
